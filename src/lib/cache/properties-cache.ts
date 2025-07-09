interface CachedProperty {
  id: string;
  title: string;
  location: string;
  property_configurations?: Record<string, unknown>[];
  property_images?: Record<string, unknown>[];
  cachedAt: number;
}

class PropertiesCache {
  private cache = new Map<string, CachedProperty[]>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  cacheProperties(key: string, properties: Record<string, unknown>[]): void {
    const cachedProperties = properties.map(property => ({
      ...property,
      cachedAt: Date.now()
    })) as CachedProperty[];
    
    this.cache.set(key, cachedProperties);
  }

  getCachedProperties(key: string): Record<string, unknown>[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is still valid
    const now = Date.now();
    const isValid = cached.every(property => 
      (now - property.cachedAt) < this.cacheTimeout
    );

    if (!isValid) {
      this.cache.delete(key);
      return null;
    }

    return cached.map(property => {
      // Return all properties except cachedAt since it's not needed
      const { id, title, location, property_configurations, property_images } = property;
      return { id, title, location, property_configurations, property_images };
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  generateCacheKey(filters: Record<string, unknown>): string {
    return JSON.stringify(filters);
  }
}

export const propertiesCache = new PropertiesCache(); 