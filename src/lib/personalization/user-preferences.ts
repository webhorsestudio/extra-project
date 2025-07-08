import { Property } from '@/types/property';
import { SimilarityScore } from '../similarity-algorithm';

export interface UserPreference {
  userId: string;
  propertyTypes: string[];
  priceRange: {
    min: number;
    max: number;
  };
  locations: string[];
  amenities: string[];
  collections: string[];
  developers: string[];
  lastUpdated: string;
}

export interface UserBehavior {
  userId: string;
  viewedProperties: string[];
  favoritedProperties: string[];
  searchedLocations: string[];
  searchedTypes: string[];
  priceRanges: number[];
  lastActivity: string;
}

export interface PersonalizedRecommendation {
  propertyId: string;
  score: number;
  reason: string;
  factors: {
    preference: number;
    behavior: number;
    similarity: number;
  };
}

export class UserPreferenceService {
  private preferences = new Map<string, UserPreference>();
  private behaviors = new Map<string, UserBehavior>();

  /**
   * Update user preferences based on interactions
   */
  updatePreferences(
    userId: string,
    property: Property,
    interactionType: 'view' | 'favorite' | 'search' | 'contact'
  ): void {
    const currentPrefs = this.preferences.get(userId) || this.createDefaultPreferences(userId);
    const currentBehavior = this.behaviors.get(userId) || this.createDefaultBehavior(userId);

    // Update behavior tracking
    this.updateBehavior(currentBehavior, property, interactionType);

    // Update preferences based on interaction
    this.updatePreferencesFromInteraction(currentPrefs, property, interactionType);

    // Save updated data
    this.preferences.set(userId, currentPrefs);
    this.behaviors.set(userId, currentBehavior);
  }

  /**
   * Get personalized recommendations
   */
  getPersonalizedRecommendations(
    userId: string,
    currentProperty: Property,
    candidates: Property[],
    similarityScores: SimilarityScore[]
  ): PersonalizedRecommendation[] {
    const userPrefs = this.preferences.get(userId);
    const userBehavior = this.behaviors.get(userId);

    if (!userPrefs && !userBehavior) {
      // No personalization data, return similarity scores
      return similarityScores.map(score => ({
        propertyId: score.propertyId,
        score: score.score,
        reason: 'Similar property',
        factors: {
          preference: 0,
          behavior: 0,
          similarity: score.score,
        },
      }));
    }

    return candidates.map(candidate => {
      const similarityScore = similarityScores.find(s => s.propertyId === candidate.id);
      const preferenceScore = userPrefs ? this.calculatePreferenceScore(userPrefs, candidate) : 0;
      const behaviorScore = userBehavior ? this.calculateBehaviorScore(userBehavior, candidate) : 0;

      const totalScore = (
        (similarityScore?.score || 0) * 0.4 +
        preferenceScore * 0.35 +
        behaviorScore * 0.25
      );

      return {
        propertyId: candidate.id,
        score: Math.round(totalScore * 100) / 100,
        reason: this.generateRecommendationReason(preferenceScore, behaviorScore, similarityScore?.score || 0),
        factors: {
          preference: preferenceScore,
          behavior: behaviorScore,
          similarity: similarityScore?.score || 0,
        },
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate preference score for a property
   */
  private calculatePreferenceScore(prefs: UserPreference, property: Property): number {
    let score = 0;
    let totalFactors = 0;

    // Property type preference
    if (prefs.propertyTypes.includes(property.property_type)) {
      score += 1;
    }
    totalFactors++;

    // Price range preference
    const propertyPrice = this.getLowestPrice(property);
    if (propertyPrice && propertyPrice >= prefs.priceRange.min && propertyPrice <= prefs.priceRange.max) {
      score += 1;
    }
    totalFactors++;

    // Location preference
    if (prefs.locations.some(loc => property.location.toLowerCase().includes(loc.toLowerCase()))) {
      score += 1;
    }
    totalFactors++;

    // Amenities preference
    const propertyAmenities = new Set(property.amenities || []);
    const preferredAmenities = new Set(prefs.amenities);
    if (preferredAmenities.size > 0) {
      const intersection = new Set([...propertyAmenities].filter(x => preferredAmenities.has(x)));
      score += intersection.size / preferredAmenities.size;
    }
    totalFactors++;

    // Collection preference
    if (prefs.collections.includes(property.property_collection)) {
      score += 1;
    }
    totalFactors++;

    // Developer preference
    if (property.developer && prefs.developers.includes(property.developer.id)) {
      score += 1;
    }
    totalFactors++;

    return totalFactors > 0 ? score / totalFactors : 0;
  }

  /**
   * Calculate behavior score for a property
   */
  private calculateBehaviorScore(behavior: UserBehavior, property: Property): number {
    let score = 0;
    let totalFactors = 0;

    // Viewed similar properties
    const viewedSimilar = behavior.viewedProperties.filter(id => id !== property.id);
    if (viewedSimilar.length > 0) {
      score += 0.3;
    }
    totalFactors++;

    // Favorited similar properties
    const favoritedSimilar = behavior.favoritedProperties.filter(id => id !== property.id);
    if (favoritedSimilar.length > 0) {
      score += 0.4;
    }
    totalFactors++;

    // Location search behavior
    if (behavior.searchedLocations.some(loc => property.location.toLowerCase().includes(loc.toLowerCase()))) {
      score += 0.2;
    }
    totalFactors++;

    // Property type search behavior
    if (behavior.searchedTypes.includes(property.property_type)) {
      score += 0.1;
    }
    totalFactors++;

    return totalFactors > 0 ? score / totalFactors : 0;
  }

  /**
   * Update user behavior tracking
   */
  private updateBehavior(behavior: UserBehavior, property: Property, interactionType: string): void {
    behavior.lastActivity = new Date().toISOString();

    switch (interactionType) {
      case 'view':
        if (!behavior.viewedProperties.includes(property.id)) {
          behavior.viewedProperties.push(property.id);
          // Keep only last 50 viewed properties
          if (behavior.viewedProperties.length > 50) {
            behavior.viewedProperties = behavior.viewedProperties.slice(-50);
          }
        }
        break;

      case 'favorite':
        if (!behavior.favoritedProperties.includes(property.id)) {
          behavior.favoritedProperties.push(property.id);
          // Keep only last 20 favorited properties
          if (behavior.favoritedProperties.length > 20) {
            behavior.favoritedProperties = behavior.favoritedProperties.slice(-20);
          }
        }
        break;

      case 'search':
        // Add location to searched locations
        if (!behavior.searchedLocations.includes(property.location)) {
          behavior.searchedLocations.push(property.location);
          if (behavior.searchedLocations.length > 20) {
            behavior.searchedLocations = behavior.searchedLocations.slice(-20);
          }
        }

        // Add property type to searched types
        if (!behavior.searchedTypes.includes(property.property_type)) {
          behavior.searchedTypes.push(property.property_type);
        }
        break;
    }
  }

  /**
   * Update preferences based on interaction
   */
  private updatePreferencesFromInteraction(prefs: UserPreference, property: Property, interactionType: string): void {
    prefs.lastUpdated = new Date().toISOString();

    // Add property type if not already present
    if (!prefs.propertyTypes.includes(property.property_type)) {
      prefs.propertyTypes.push(property.property_type);
    }

    // Update price range
    const propertyPrice = this.getLowestPrice(property);
    if (propertyPrice) {
      if (prefs.priceRange.min === 0 || propertyPrice < prefs.priceRange.min) {
        prefs.priceRange.min = propertyPrice;
      }
      if (propertyPrice > prefs.priceRange.max) {
        prefs.priceRange.max = propertyPrice;
      }
    }

    // Add location if not already present
    if (!prefs.locations.includes(property.location)) {
      prefs.locations.push(property.location);
    }

    // Add amenities
    if (property.amenities) {
      property.amenities.forEach(amenity => {
        if (!prefs.amenities.includes(amenity)) {
          prefs.amenities.push(amenity);
        }
      });
    }

    // Add collection if not already present
    if (!prefs.collections.includes(property.property_collection)) {
      prefs.collections.push(property.property_collection);
    }

    // Add developer if not already present
    if (property.developer && !prefs.developers.includes(property.developer.id)) {
      prefs.developers.push(property.developer.id);
    }
  }

  /**
   * Create default preferences
   */
  private createDefaultPreferences(userId: string): UserPreference {
    return {
      userId,
      propertyTypes: [],
      priceRange: { min: 0, max: 0 },
      locations: [],
      amenities: [],
      collections: [],
      developers: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Create default behavior
   */
  private createDefaultBehavior(userId: string): UserBehavior {
    return {
      userId,
      viewedProperties: [],
      favoritedProperties: [],
      searchedLocations: [],
      searchedTypes: [],
      priceRanges: [],
      lastActivity: new Date().toISOString(),
    };
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
   * Generate recommendation reason
   */
  private generateRecommendationReason(preferenceScore: number, behaviorScore: number, similarityScore: number): string {
    const reasons = [];

    if (similarityScore > 0.7) {
      reasons.push('Very similar to what you viewed');
    } else if (similarityScore > 0.5) {
      reasons.push('Similar to your interests');
    }

    if (preferenceScore > 0.7) {
      reasons.push('Matches your preferences');
    } else if (preferenceScore > 0.5) {
      reasons.push('Partially matches your preferences');
    }

    if (behaviorScore > 0.7) {
      reasons.push('Based on your activity');
    } else if (behaviorScore > 0.5) {
      reasons.push('Similar to your previous choices');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'Recommended for you';
  }

  /**
   * Get user preferences
   */
  getUserPreferences(userId: string): UserPreference | null {
    return this.preferences.get(userId) || null;
  }

  /**
   * Get user behavior
   */
  getUserBehavior(userId: string): UserBehavior | null {
    return this.behaviors.get(userId) || null;
  }

  /**
   * Clear user data
   */
  clearUserData(userId: string): void {
    this.preferences.delete(userId);
    this.behaviors.delete(userId);
  }
}

// Export singleton instance
export const userPreferenceService = new UserPreferenceService(); 