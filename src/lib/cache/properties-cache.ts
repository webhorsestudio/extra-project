interface CachedProperty {
  id: string;
  title: string;
  location: string;
  property_configurations?: any[];
  property_images?: any[];
  cachedAt: number;
}

class PropertiesCache {
  private cache = new Map<string, CachedProperty[]>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  cacheProperties(key: string, properties: any[]): void {
    const cachedProperties = properties.map(property => ({
      ...property,
      cachedAt: Date.now()
    }));
    
    this.cache.set(key, cachedProperties);
  }

  getCachedProperties(key: string): any[] | null {
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
      const { cachedAt, ...rest } = property;
      return rest;
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  generateCacheKey(filters: any): string {
    return JSON.stringify(filters);
  }
}

export const propertiesCache = new PropertiesCache(); 