import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Property } from '@/types/property';
import { similarityEngine, SimilarityScore } from '../similarity-algorithm';
import { propertyCache } from '../cache/property-cache';
import { userPreferenceService, PersonalizedRecommendation } from '../personalization/user-preferences';
import { SupabaseClient } from '@supabase/supabase-js';
import { CacheStats } from '../cache/property-cache';

export interface EnhancedSimilarPropertiesResult {
  properties: Property[];
  scores: SimilarityScore[];
  personalizedScores: PersonalizedRecommendation[];
  cacheHit: boolean;
  algorithm: 'cached' | 'similarity' | 'fallback';
  metadata: {
    totalCandidates: number;
    processingTime: number;
    cacheStats: CacheStats;
  };
}

export class SimilarPropertiesService {
  /**
   * Get enhanced similar properties with caching and personalization
   */
  async getSimilarProperties(
    currentProperty: Property,
    userId?: string,
    limit: number = 6
  ): Promise<EnhancedSimilarPropertiesResult> {
    const startTime = Date.now();

    // Try to get from cache first
    const cached = propertyCache.getCachedSimilarProperties(currentProperty.id);
    if (cached) {
      const personalizedScores = userId 
        ? userPreferenceService.getPersonalizedRecommendations(
            userId, 
            currentProperty, 
            cached.properties, 
            cached.scores
          )
        : [];

      return {
        properties: cached.properties,
        scores: cached.scores,
        personalizedScores,
        cacheHit: true,
        algorithm: 'cached',
        metadata: {
          totalCandidates: cached.properties.length,
          processingTime: Date.now() - startTime,
          cacheStats: propertyCache.getStats(),
        },
      };
    }

    // Fetch candidates from database
    const candidates = await this.fetchPropertyCandidates(currentProperty, limit * 3);
    
    if (candidates.length === 0) {
      return {
        properties: [],
        scores: [],
        personalizedScores: [],
        cacheHit: false,
        algorithm: 'fallback',
        metadata: {
          totalCandidates: 0,
          processingTime: Date.now() - startTime,
          cacheStats: propertyCache.getStats(),
        },
      };
    }

    // Calculate similarity scores
    const similarityScores = similarityEngine.findSimilarProperties(
      currentProperty,
      candidates,
      limit
    );

    // Get the actual properties for the top scores
    const similarProperties = similarityScores
      .map(score => candidates.find(p => p.id === score.propertyId))
      .filter(Boolean) as Property[];

    // Get personalized recommendations if user is logged in
    const personalizedScores = userId 
      ? userPreferenceService.getPersonalizedRecommendations(
          userId, 
          currentProperty, 
          similarProperties, 
          similarityScores
        )
      : [];

    // Cache the results
    propertyCache.cacheSimilarProperties(
      currentProperty.id,
      similarProperties,
      similarityScores
    );

    // Update user preferences if user is logged in
    if (userId) {
      userPreferenceService.updatePreferences(userId, currentProperty);
    }

    return {
      properties: similarProperties,
      scores: similarityScores,
      personalizedScores,
      cacheHit: false,
      algorithm: 'similarity',
      metadata: {
        totalCandidates: candidates.length,
        processingTime: Date.now() - startTime,
        cacheStats: propertyCache.getStats(),
      },
    };
  }

  /**
   * Fetch property candidates from database
   */
  private async fetchPropertyCandidates(currentProperty: Property, limit: number): Promise<Property[]> {
    const supabase = await createSupabaseServerClient();

    try {
      // Multi-tier search strategy
      const queries = [
        // Tier 1: Same type + Same location + Similar price
        this.buildTier1Query(supabase, currentProperty, limit),
        // Tier 2: Same type + Same location
        this.buildTier2Query(supabase, currentProperty, limit),
        // Tier 3: Same type only
        this.buildTier3Query(supabase, currentProperty, limit),
        // Tier 4: Same location only
        this.buildTier4Query(supabase, currentProperty, limit),
      ];

      // Execute all queries and wait for results
      const results = await Promise.allSettled(queries.map(async (query) => {
        const result = await query;
        return result.data || [];
      }));
      const allProperties = new Map<string, Property>();

      results.forEach((result) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          result.value.forEach((property: Record<string, unknown>) => {
            if (!allProperties.has(property.id as string)) {
              allProperties.set(property.id as string, property as unknown as Property);
            }
          });
        }
      });

      return Array.from(allProperties.values()).slice(0, limit);
    } catch (error) {
      console.error('Error fetching property candidates:', error);
      return [];
    }
  }

  /**
   * Build Tier 1 query: Same type + Same location + Similar price
   */
  private buildTier1Query(supabase: SupabaseClient, currentProperty: Property, limit: number) {
    return supabase
      .from('properties')
      .select(`
        id,
        title,
        location,
        property_type,
        property_collection,
        latitude,
        longitude,
        amenities,
        property_images (
          id,
          image_url
        ),
        property_configurations (
          id,
          bhk,
          price,
          area,
          bedrooms,
          bathrooms,
          ready_by
        ),
        location_data:property_locations (
          id,
          name
        ),
        developer:property_developers (
          id,
          name,
          website,
          address,
          logo_url
        )
      `)
      .eq('status', 'active')
      .neq('id', currentProperty.id)
      .eq('property_type', currentProperty.property_type)
      .eq('location', currentProperty.location)
      .limit(limit);
  }

  /**
   * Build Tier 2 query: Same type + Same location
   */
  private buildTier2Query(supabase: SupabaseClient, currentProperty: Property, limit: number) {
    return supabase
      .from('properties')
      .select(`
        id,
        title,
        location,
        property_type,
        property_collection,
        latitude,
        longitude,
        amenities,
        property_images (
          id,
          image_url
        ),
        property_configurations (
          id,
          bhk,
          price,
          area,
          bedrooms,
          bathrooms,
          ready_by
        ),
        location_data:property_locations (
          id,
          name
        ),
        developer:property_developers (
          id,
          name,
          website,
          address,
          logo_url
        )
      `)
      .eq('status', 'active')
      .neq('id', currentProperty.id)
      .eq('property_type', currentProperty.property_type)
      .eq('location', currentProperty.location)
      .limit(limit);
  }

  /**
   * Build Tier 3 query: Same type only
   */
  private buildTier3Query(supabase: SupabaseClient, currentProperty: Property, limit: number) {
    return supabase
      .from('properties')
      .select(`
        id,
        title,
        location,
        property_type,
        property_collection,
        latitude,
        longitude,
        amenities,
        property_images (
          id,
          image_url
        ),
        property_configurations (
          id,
          bhk,
          price,
          area,
          bedrooms,
          bathrooms,
          ready_by
        ),
        location_data:property_locations (
          id,
          name
        ),
        developer:property_developers (
          id,
          name,
          website,
          address,
          logo_url
        )
      `)
      .eq('status', 'active')
      .neq('id', currentProperty.id)
      .eq('property_type', currentProperty.property_type)
      .limit(limit);
  }

  /**
   * Build Tier 4 query: Same location only
   */
  private buildTier4Query(supabase: SupabaseClient, currentProperty: Property, limit: number) {
    return supabase
      .from('properties')
      .select(`
        id,
        title,
        location,
        property_type,
        property_collection,
        latitude,
        longitude,
        amenities,
        property_images (
          id,
          image_url
        ),
        property_configurations (
          id,
          bhk,
          price,
          area,
          bedrooms,
          bathrooms,
          ready_by
        ),
        location_data:property_locations (
          id,
          name
        ),
        developer:property_developers (
          id,
          name,
          website,
          address,
          logo_url
        )
      `)
      .eq('status', 'active')
      .neq('id', currentProperty.id)
      .eq('location', currentProperty.location)
      .limit(limit);
  }

  /**
   * Get lowest price from property configurations
   */
  private getLowestPrice(property: Property): number | null {
    if (!property.property_configurations || property.property_configurations.length === 0) {
      return null;
    }

    const prices = property.property_configurations
      .map(config => config.price)
      .filter(price => price > 0);

    return prices.length > 0 ? Math.min(...prices) : null;
  }

  /**
   * Invalidate cache for a property
   */
  invalidateCache(propertyId: string): void {
    propertyCache.invalidateProperty(propertyId);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return propertyCache.getStats();
  }
}

// Export singleton instance
export const similarPropertiesService = new SimilarPropertiesService(); 