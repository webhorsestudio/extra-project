import React from 'react';
import PropertyCardV2 from './PropertyCardV2';

export default {
  title: 'Web/PropertyCardV2',
  component: PropertyCardV2,
};

const mockProperty = {
  id: '1',
  title: 'Luxury Apartment in Downtown',
  description: 'A beautiful luxury apartment in the heart of downtown',
  property_type: 'Apartment' as const,
  property_collection: 'Featured' as const,
  location: 'Downtown, City',
  latitude: 12.9716,
  longitude: 77.5946,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: 'user1',
  posted_by: 'user1',
  parking: true,
  parking_spots: 2,
  property_images: [
    { 
      id: '1',
      property_id: '1',
      image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      created_at: '2024-01-01T00:00:00Z'
    }
  ],
  property_configurations: [
    {
      id: '1',
      property_id: '1',
      price: 2500000,
      bhk: 2,
      area: 1200,
      bedrooms: 2,
      bathrooms: 2
    }
  ]
};

export const Default = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
    <PropertyCardV2 property={mockProperty} />
  </div>
); 