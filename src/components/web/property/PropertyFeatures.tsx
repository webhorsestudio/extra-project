'use client';
import React, { useState } from 'react';
import * as LucideIconsImport from 'lucide-react';
import { Property } from '@/types/property';
import Image from 'next/image'

const LucideIcons = LucideIconsImport as unknown as Record<string, React.ComponentType<{ className?: string }>>;

interface PropertyFeaturesProps {
  property: Property;
}

// Pill-shaped tab navigation for two tabs (restored)
function FeaturesTabNav({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  return (
    <div className="mb-6 flex gap-4">
      <button
        className={`px-8 py-3 rounded-2xl font-semibold text-lg shadow-md focus:outline-none transition-colors ${activeTab === 'amenities' ? 'bg-[#0A1736] text-white' : 'bg-gray-100 text-[#0A1736]'}`}
        onClick={() => setActiveTab('amenities')}
      >
        Amenities List
      </button>
      <button
        className={`px-8 py-3 rounded-2xl font-semibold text-lg shadow-md focus:outline-none transition-colors ${activeTab === 'categories' ? 'bg-[#0A1736] text-white' : 'bg-gray-100 text-[#0A1736]'}`}
        onClick={() => setActiveTab('categories')}
      >
        Category List
      </button>
    </div>
  );
}

// Card with image and title only
function FeatureCard({ title, image }: { title: string; image: string }) {
  return (
    <div className="flex items-center bg-white rounded-xl border border-[#FFD700]/40 shadow-sm p-4 gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 max-w-md mb-4">
      <Image
        src={image}
        alt={title}
        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200"
        width={48}
        height={48}
      />
      <div className="font-medium text-base text-[#1a2236]">{title}</div>
    </div>
  );
}

// Card with icon and title only
function CategoryCard({ title, icon }: { title: string; icon: string }) {
  const LucideIcon = (icon && LucideIcons[icon]) ? LucideIcons[icon] : LucideIcons['Home'];
  return (
    <div className="flex items-center bg-white rounded-xl border border-[#FFD700]/40 shadow-sm p-4 gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 max-w-md mb-4">
      <div className="w-12 h-12 rounded-lg bg-[#FFF8DC] flex items-center justify-center flex-shrink-0 border border-[#FFD700]/60">
        <LucideIcon className="h-6 w-6 text-[#B8860B]" />
      </div>
      <div className="font-medium text-base text-[#1a2236]">{title}</div>
    </div>
  );
}

// Helper function to get amenity image
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

export default function PropertyFeatures({ property }: PropertyFeaturesProps) {
  const [activeTab, setActiveTab] = useState('amenities');

  // Use real amenities data
  const amenities = property.amenities && property.amenities.length > 0
    ? property.amenities.map((amenity: string) => ({
        title: amenity,
        image: getAmenityImage(amenity),
      }))
    : [];

  // Use real categories data
  const categories = property.categories && property.categories.length > 0
    ? property.categories.map((category: string) => ({
        title: category,
        icon: 'Home',
      }))
    : [];

  return (
    <section className="bg-transparent mb-8">
      <h2 className="text-2xl font-bold mb-6 text-[#0A1736]">Features</h2>
      <FeaturesTabNav activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'amenities' ? (
        amenities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {amenities.map((amenity, idx) => (
              <FeatureCard key={idx} title={amenity.title} image={amenity.image} />
            ))}
          </div>
        ) : (
          <div className="text-gray-400 italic text-center py-8">No amenities listed for this property.</div>
        )
      ) : (
        categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {categories.map((cat, idx) => (
              <CategoryCard key={idx} title={cat.title} icon={cat.icon} />
            ))}
          </div>
        ) : (
          <div className="text-gray-400 italic text-center py-8">No categories listed for this property.</div>
        )
      )}
    </section>
  );
} 