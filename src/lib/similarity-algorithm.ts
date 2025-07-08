import { Property } from '@/types/property';

export interface SimilarityScore {
  propertyId: string;
  score: number;
  factors: {
    location: number;
    type: number;
    price: number;
    size: number;
    amenities: number;
    collection: number;
    developer: number;
  };
}

export interface SimilarityConfig {
  weights: {
    location: number;
    type: number;
    price: number;
    size: number;
    amenities: number;
    collection: number;
    developer: number;
  };
  priceTolerance: number;
  sizeTolerance: number;
  maxDistance: number; // in kilometers
}

const DEFAULT_CONFIG: SimilarityConfig = {
  weights: {
    location: 0.25,
    type: 0.20,
    price: 0.20,
    size: 0.15,
    amenities: 0.10,
    collection: 0.05,
    developer: 0.05,
  },
  priceTolerance: 0.3, // 30% price difference tolerance
  sizeTolerance: 0.4, // 40% size difference tolerance
  maxDistance: 10, // 10km radius
};

export class PropertySimilarityEngine {
  private config: SimilarityConfig;

  constructor(config: Partial<SimilarityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Calculate similarity score between two properties
   */
  calculateSimilarity(currentProperty: Property, candidateProperty: Property): SimilarityScore {
    const factors = {
      location: this.calculateLocationSimilarity(currentProperty, candidateProperty),
      type: this.calculateTypeSimilarity(currentProperty, candidateProperty),
      price: this.calculatePriceSimilarity(currentProperty, candidateProperty),
      size: this.calculateSizeSimilarity(currentProperty, candidateProperty),
      amenities: this.calculateAmenitiesSimilarity(currentProperty, candidateProperty),
      collection: this.calculateCollectionSimilarity(currentProperty, candidateProperty),
      developer: this.calculateDeveloperSimilarity(currentProperty, candidateProperty),
    };

    const totalScore = Object.entries(factors).reduce((score, [key, value]) => {
      return score + (value * this.config.weights[key as keyof typeof factors]);
    }, 0);

    return {
      propertyId: candidateProperty.id,
      score: Math.round(totalScore * 100) / 100,
      factors,
    };
  }

  /**
   * Calculate location similarity based on distance
   */
  private calculateLocationSimilarity(current: Property, candidate: Property): number {
    if (!current.latitude || !current.longitude || !candidate.latitude || !candidate.longitude) {
      return 0;
    }

    const distance = this.calculateDistance(
      current.latitude, current.longitude,
      candidate.latitude, candidate.longitude
    );

    if (distance > this.config.maxDistance) {
      return 0;
    }

    // Exponential decay based on distance
    return Math.exp(-distance / 5);
  }

  /**
   * Calculate property type similarity
   */
  private calculateTypeSimilarity(current: Property, candidate: Property): number {
    if (current.property_type === candidate.property_type) {
      return 1;
    }

    // Type compatibility matrix
    const typeCompatibility: Record<string, string[]> = {
      'Apartment': ['Penthouse', 'Villa'],
      'House': ['Villa', 'Penthouse'],
      'Villa': ['House', 'Penthouse'],
      'Penthouse': ['Apartment', 'Villa'],
      'Commercial': ['Land'],
      'Land': ['Commercial'],
    };

    const compatibleTypes = typeCompatibility[current.property_type] || [];
    return compatibleTypes.includes(candidate.property_type) ? 0.5 : 0;
  }

  /**
   * Calculate price similarity with tolerance
   */
  private calculatePriceSimilarity(current: Property, candidate: Property): number {
    const currentPrice = this.getLowestPrice(current);
    const candidatePrice = this.getLowestPrice(candidate);

    if (!currentPrice || !candidatePrice) {
      return 0.5; // Neutral score if price not available
    }

    const priceDiff = Math.abs(currentPrice - candidatePrice) / currentPrice;
    
    if (priceDiff <= this.config.priceTolerance) {
      return 1 - (priceDiff / this.config.priceTolerance);
    }

    return 0;
  }

  /**
   * Calculate size similarity
   */
  private calculateSizeSimilarity(current: Property, candidate: Property): number {
    const currentSize = this.getAverageSize(current);
    const candidateSize = this.getAverageSize(candidate);

    if (!currentSize || !candidateSize) {
      return 0.5;
    }

    const sizeDiff = Math.abs(currentSize - candidateSize) / currentSize;
    
    if (sizeDiff <= this.config.sizeTolerance) {
      return 1 - (sizeDiff / this.config.sizeTolerance);
    }

    return 0;
  }

  /**
   * Calculate amenities similarity
   */
  private calculateAmenitiesSimilarity(current: Property, candidate: Property): number {
    const currentAmenities = new Set(current.amenities || []);
    const candidateAmenities = new Set(candidate.amenities || []);

    if (currentAmenities.size === 0 && candidateAmenities.size === 0) {
      return 1;
    }

    if (currentAmenities.size === 0 || candidateAmenities.size === 0) {
      return 0;
    }

    const intersection = new Set([...currentAmenities].filter(x => candidateAmenities.has(x)));
    const union = new Set([...currentAmenities, ...candidateAmenities]);

    return intersection.size / union.size;
  }

  /**
   * Calculate collection similarity
   */
  private calculateCollectionSimilarity(current: Property, candidate: Property): number {
    if (current.property_collection === candidate.property_collection) {
      return 1;
    }

    // Collection compatibility
    const collectionCompatibility: Record<string, string[]> = {
      'Newly Launched': ['Featured'],
      'Featured': ['Newly Launched', 'Ready to Move'],
      'Under Construction': ['Ready to Move'],
      'Ready to Move': ['Featured', 'Under Construction'],
    };

    const compatibleCollections = collectionCompatibility[current.property_collection] || [];
    return compatibleCollections.includes(candidate.property_collection) ? 0.7 : 0.3;
  }

  /**
   * Calculate developer similarity
   */
  private calculateDeveloperSimilarity(current: Property, candidate: Property): number {
    if (!current.developer || !candidate.developer) {
      return 0.5;
    }

    if (current.developer.id === candidate.developer.id) {
      return 1;
    }

    return 0.2; // Low score for different developers
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
   * Get average size from property configurations
   */
  private getAverageSize(property: Property): number | null {
    if (!property.property_configurations || property.property_configurations.length === 0) {
      return null;
    }

    const sizes = property.property_configurations
      .map(config => config.area)
      .filter(area => area > 0);

    if (sizes.length === 0) return null;

    return sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find similar properties with advanced scoring
   */
  findSimilarProperties(
    currentProperty: Property,
    candidates: Property[],
    limit: number = 6
  ): SimilarityScore[] {
    const scores = candidates
      .filter(candidate => candidate.id !== currentProperty.id)
      .map(candidate => this.calculateSimilarity(currentProperty, candidate))
      .filter(score => score.score > 0.3) // Minimum similarity threshold
      .sort((a, b) => b.score - a.score);

    return scores.slice(0, limit);
  }
}

// Export singleton instance
export const similarityEngine = new PropertySimilarityEngine(); 