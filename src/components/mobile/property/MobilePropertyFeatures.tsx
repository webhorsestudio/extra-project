'use client';

import React, { useState } from 'react';
import * as LucideIconsImport from 'lucide-react';
import { Home, Heart, Star, Users, Wifi, Building, Car, Trees, Shield, Zap, Sun, Wine } from 'lucide-react';
import { Property } from '@/types/property';

const LucideIcons = LucideIconsImport as Record<string, any>;

interface MobilePropertyFeaturesProps {
  property: Property;
}

// Pill-shaped tab navigation for two tabs (same as web layout)
function FeaturesTabNav({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  return (
    <div className="mb-6 flex gap-3">
      <button
        className={`px-6 py-2.5 rounded-xl font-semibold text-base shadow-md focus:outline-none transition-colors ${activeTab === 'amenities' ? 'bg-[#0A1736] text-white' : 'bg-gray-100 text-[#0A1736]'}`}
        onClick={() => setActiveTab('amenities')}
      >
        Amenities List
      </button>
      <button
        className={`px-6 py-2.5 rounded-xl font-semibold text-base shadow-md focus:outline-none transition-colors ${activeTab === 'categories' ? 'bg-[#0A1736] text-white' : 'bg-gray-100 text-[#0A1736]'}`}
        onClick={() => setActiveTab('categories')}
      >
        Category List
      </button>
    </div>
  );
}

// Card with image and title only (mobile optimized)
function FeatureCard({ title, image }: { title: string; image: string }) {
  return (
    <div className="flex items-center bg-white rounded-xl border border-[#FFD700]/40 shadow-sm p-3 gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 mb-3">
      <img
        src={image}
        alt={title}
        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200"
      />
      <div className="font-medium text-sm text-[#1a2236]">{title}</div>
    </div>
  );
}

// Card with icon and title only (mobile optimized)
function CategoryCard({ title, icon }: { title: string; icon: string }) {
  const LucideIcon = (icon && LucideIcons[icon]) ? LucideIcons[icon] : LucideIcons['Home'];
  return (
    <div className="flex items-center bg-white rounded-xl border border-[#FFD700]/40 shadow-sm p-3 gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 mb-3">
      <div className="w-10 h-10 rounded-lg bg-[#FFF8DC] flex items-center justify-center flex-shrink-0 border border-[#FFD700]/60">
        <LucideIcon className="h-5 w-5 text-[#B8860B]" />
      </div>
      <div className="font-medium text-sm text-[#1a2236]">{title}</div>
    </div>
  );
}

// Helper function to get amenity image (same as web layout)
function getAmenityImage(amenityName: string) {
  const imageMap: { [key: string]: string } = {
    'Pool': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80',
    'Clubhouse': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=200&q=80',
    'Gym': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=200&q=80',
    'Lounge': 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c5a?auto=format&fit=crop&w=200&q=80',
    'Garden': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=200&q=80',
    'Parking': 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=200&q=80',
    'Security': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=200&q=80',
  };
  return imageMap[amenityName] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80';
}

export default function MobilePropertyFeatures({ property }: MobilePropertyFeaturesProps) {
  const [activeTab, setActiveTab] = useState('amenities');

  // Use real amenities data (same as web layout)
  const amenities = property.amenities && property.amenities.length > 0
    ? property.amenities.map((amenity: any) => ({
        title: amenity.name,
        image: amenity.image_url || getAmenityImage(amenity.name),
      }))
    : [];

  // Use real categories data (same as web layout)
  const categories = property.categories && property.categories.length > 0
    ? property.categories.map((category: any) => ({
        title: category.name,
        icon: category.icon,
      }))
    : [];

  if (amenities.length === 0 && categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full mx-1 my-4">
      <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-sm px-6 pt-6 pb-6">
        {/* Section Header */}
        <div className="text-lg font-bold text-black mb-3">Features</div>
        
        {/* Tab Navigation */}
        <FeaturesTabNav activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Content */}
        {activeTab === 'amenities' ? (
          amenities.length > 0 ? (
            <div className="space-y-2">
              {amenities.map((amenity, idx) => (
                <FeatureCard key={idx} title={amenity.title} image={amenity.image} />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 italic text-center py-8">No amenities listed for this property.</div>
          )
        ) : (
          categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((cat, idx) => (
                <CategoryCard key={idx} title={cat.title} icon={cat.icon} />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 italic text-center py-8">No categories listed for this property.</div>
          )
        )}
      </div>
    </div>
  );
} 