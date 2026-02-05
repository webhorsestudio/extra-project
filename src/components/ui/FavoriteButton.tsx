"use client";
import React, { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FavoriteButtonProps {
  propertyId: string;
  initialIsFavorited?: boolean;
  onUnfavorite?: (propertyId: string) => void;
  isWishlist?: boolean;
  className?: string;
  iconClassName?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  propertyId, 
  initialIsFavorited = false, 
  onUnfavorite, 
  isWishlist, 
  className = '', 
  iconClassName = '' 
}) => {
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', { 
          method: 'GET',
          credentials: 'include'
        });
        setIsAuthenticated(response.ok);
        
        // If authenticated, fetch initial favorite status
        if (response.ok) {
          const favResponse = await fetch(`/api/properties/${propertyId}/favorites`, {
            method: 'GET',
            credentials: 'include'
          });
          if (favResponse.ok) {
            const data = await favResponse.json();
            setIsFavorited(data.isFavorited);
          }
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [propertyId]);

  const handleToggle = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add properties to your wishlist.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const res = await fetch(`/api/properties/${propertyId}/favorites`, { 
        method,
        credentials: 'include'
      });
      
      if (res.ok) {
        setIsFavorited(!isFavorited);
        toast({
          title: isFavorited ? 'Removed from wishlist' : 'Added to wishlist',
          description: isFavorited ? 'Property removed from your wishlist.' : 'Property added to your wishlist.'
        });
        if (isWishlist && isFavorited && onUnfavorite) {
          onUnfavorite(propertyId);
        }
      } else if (res.status === 401) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to manage your wishlist.',
          variant: 'destructive'
        });
      } else {
        const data = await res.json();
        toast({ 
          title: 'Error', 
          description: data.error || 'Failed to update wishlist.',
          variant: 'destructive'
        });
      }
    } catch {
      toast({ 
        title: 'Error', 
        description: 'Failed to update wishlist. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <button
        className={`bg-white/10 hover:bg-white/20 rounded-lg p-2 text-gray-400 ${className}`}
        disabled
        aria-label="Loading"
        type="button"
      >
        <Loader2 className="h-6 w-6 animate-spin" />
      </button>
    );
  }

  return (
    <button
      className={`bg-white/10 hover:bg-white/20 rounded-lg p-2 ${isFavorited ? 'text-red-500' : 'text-[#1a2236]'} ${className}`}
      onClick={handleToggle}
      aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
      disabled={loading}
      type="button"
    >
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <Heart className={`h-6 w-6 ${isFavorited ? 'fill-red-500' : ''} ${iconClassName}`} />
      )}
    </button>
  );
};

export default FavoriteButton; 