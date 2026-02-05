"use client";
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PropertyCard from '@/components/mobile/PropertyCard';
import { Property } from '@/types/property';

export default function MobileWishlistContent({ properties: initialProperties }: { properties: Property[] | null }) {
  const [properties, setProperties] = useState(initialProperties ?? []);

  // If user is not signed in
  if (initialProperties === null) {
    return (
      <div className="bg-gray-50 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Heart className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your wishlist</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Please log in to save properties and access your wishlist across devices.
        </p>
        <Button size="lg" asChild>
          <a href="/users/login">Login</a>
        </Button>
      </div>
    );
  }

  const handleUnfavorite = (propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
  };

  return (
    <div className="bg-gray-50">
      {/* Page Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-gray-600 mt-1">Your saved properties</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-sm">
                {properties.length} Properties
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 py-6">
        {properties.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring properties and save your favorites to your wishlist for easy access later.
            </p>
            <Button size="lg" asChild>
              <a href="/m">Browse Properties</a>
            </Button>
          </div>
        ) : (
          // Wishlist Items
          <div className="grid grid-cols-1 gap-4">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                initialIsFavorited={true}
                onUnfavorite={handleUnfavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 