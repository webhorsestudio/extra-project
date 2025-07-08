'use client';

import React from 'react';
import { Property } from '@/types/property';
import { MapPin, Bed, Ruler, Calendar } from 'lucide-react';

interface MobilePropertyInfoCardProps {
  property: Property;
}

export default function MobilePropertyInfoCard({ property }: MobilePropertyInfoCardProps) {
  const firstConfig = property.property_configurations?.[0];
  const price = firstConfig?.price ?? property.price;
  const beds = firstConfig?.bedrooms || firstConfig?.bhk || property.bedrooms;
  const area = firstConfig?.area || property.area;
  const status = property.property_collection || property.status;
  const location = property.location_data?.name || property.location;

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "Contact for price";
    if (amount >= 1e7) return `₹${Math.round(amount / 1e7)} Cr`;
    if (amount >= 1e5) return `₹${Math.round(amount / 1e5)} Lacs`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // EMI calculation (dummy for now)
  const emi = typeof price === 'number' ? `₹${Math.round((price * 0.009) / 100000) * 100000}` : null;

  return (
    <div className="relative z-20 -mt-12 w-full flex justify-center">
      {/* Status Badge */}
      {status && (
        <div className="absolute -top-4 left-4 z-30">
          <span className="bg-black/80 backdrop-blur text-white text-xs font-bold px-4 py-1 rounded-full shadow-md border-2 border-white/20">
            {status}
          </span>
        </div>
      )}
      <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-3xl w-full max-w-xl p-6 pt-7 pb-6 flex flex-col mx-1">
        {/* Price and Project Name */}
        <div className="mb-2">
          <div className="text-2xl font-bold text-black leading-tight mb-1">
            Starts At {formatCurrency(price)}
          </div>
          <div className="text-lg font-semibold text-black leading-tight mb-2">
            {property.title}
          </div>
          <div className="flex items-center text-gray-700 text-sm mt-1 mb-1">
            <MapPin className="w-4 h-4 mr-1 text-black/70" />
            <span>{location}</span>
          </div>
        </div>
        {/* Divider */}
        <div className="border-b border-black/10 my-3" />
        {/* Features Row */}
        <div className="flex items-center justify-between text-sm font-medium text-black mb-4">
          <div className="flex items-center gap-1">
            <Bed className="w-5 h-5 mr-1 text-black/80" />
            {beds} Beds
          </div>
          <div className="flex items-center gap-1">
            <Ruler className="w-5 h-5 mr-1 text-black/80" />
            {area} Sq. Ft.
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-5 h-5 mr-1 text-black/80" />
            Ready
          </div>
        </div>
        {/* EMI/Loan Info Row */}
        <div className="flex items-center gap-3 mt-2">
          <div className="bg-black/80 backdrop-blur text-white font-bold rounded-full px-4 py-1.5 text-sm shadow-sm flex items-center" style={{ minHeight: '2.25rem' }}>
            EMI starts at {emi || "Contact"}
          </div>
          <div className="text-xs text-black/60 font-medium whitespace-nowrap ml-2">
            Exclusive Home Loan deals
          </div>
        </div>
      </div>
    </div>
  );
} 