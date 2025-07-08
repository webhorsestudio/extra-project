import { useState, useEffect, useCallback } from 'react';
import { Property } from '@/types/property';
import { PersonalizedRecommendation } from '@/lib/personalization/user-preferences';

interface UseSimilarPropertiesOptions {
  propertyId: string;
  userId?: string;
  limit?: number;
  autoFetch?: boolean;
}

interface SimilarPropertiesState {
  properties: Property[];
  personalizedScores: PersonalizedRecommendation[];
  loading: boolean;
  error: string | null;
  cacheHit: boolean;
  algorithm: string;
  metadata: {
    processingTime: number;
    totalCandidates: number;
    cacheStats: any;
  } | null;
}

export function useSimilarProperties({
  propertyId,
  userId,
  limit = 6,
  autoFetch = true,
}: UseSimilarPropertiesOptions) {
  const [state, setState] = useState<SimilarPropertiesState>({
    properties: [],
    personalizedScores: [],
    loading: false,
    error: null,
    cacheHit: false,
    algorithm: '',
    metadata: null,
  });

  const fetchSimilarProperties = useCallback(async () => {
    if (!propertyId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      if (userId) {
        params.append('userId', userId);
      }

      const response = await fetch(`/api/properties/${propertyId}/similar?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch similar properties');
      }

      const data = await response.json();

      if (data.success) {
        setState({
          properties: data.data.properties,
          personalizedScores: data.data.personalizedScores,
          loading: false,
          error: null,
          cacheHit: data.data.metadata.cacheHit,
          algorithm: data.data.metadata.algorithm,
          metadata: data.data.metadata,
        });
      } else {
        throw new Error(data.error || 'Failed to fetch similar properties');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [propertyId, userId, limit]);

  const updateUserInteraction = useCallback(async (interactionType: 'view' | 'favorite' | 'search' | 'contact') => {
    if (!userId || !propertyId) return;

    try {
      const response = await fetch(`/api/properties/${propertyId}/similar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          interactionType,
        }),
      });

      if (!response.ok) {
        console.error('Failed to update user interaction');
      }
    } catch (error) {
      console.error('Error updating user interaction:', error);
    }
  }, [userId, propertyId]);

  const refresh = useCallback(() => {
    fetchSimilarProperties();
  }, [fetchSimilarProperties]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchSimilarProperties();
    }
  }, [fetchSimilarProperties, autoFetch]);

  return {
    ...state,
    fetchSimilarProperties,
    updateUserInteraction,
    refresh,
  };
} 