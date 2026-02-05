'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';
import { MapPin, Bed, Ruler, Calendar } from 'lucide-react';
import MobileEmiCalculatorModal from './MobileEmiCalculatorModal';

interface MobilePropertyInfoCardProps {
  property: Property;
}

export default function MobilePropertyInfoCard({ property }: MobilePropertyInfoCardProps) {
  const [emiModalOpen, setEmiModalOpen] = useState(false);
  
  const firstConfig = property.property_configurations?.[0];
  const price = firstConfig?.price ?? property.price;
  const beds = firstConfig?.bedrooms || firstConfig?.bhk || property.bedrooms;
  const area = firstConfig?.area || property.area;
  const status = property.property_collection || property.status;
  const location = property.location_data?.name || property.location;
  
  // Get ready_by date from first configuration
  const readyBy = firstConfig?.ready_by;

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "Contact for price";
    if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)} Cr`;
    if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(2)} Lacs`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Proper EMI calculation using the same logic as web
  const calculateEMI = (price: number) => {
    // Simple EMI calculation: 10% down payment, 8.5% interest rate, 20 years
    const downPayment = price * 0.1;
    const loanAmount = price - downPayment;
    const monthlyRate = 0.085 / 12;
    const totalMonths = 20 * 12;
    
    if (monthlyRate === 0) return loanAmount / totalMonths;
    
    const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / 
                (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    return Math.round(emi);
  };

  const emiAmount = typeof price === 'number' && price > 0 ? calculateEMI(price) : 0;

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
          <div className="text-2xl font-bold text-black leading-tight mb-2">
            Starts At {formatCurrency(price)}
          </div>
          <div className="text-lg font-semibold text-black leading-tight mb-3">
            {property.title}
          </div>
          <div className="flex items-center text-gray-700 text-sm mt-1 mb-2">
            <MapPin className="w-4 h-4 mr-1 text-black/70" />
            <span>{location}</span>
          </div>
        </div>
        {/* Divider */}
        <div className="border-b border-black/10 my-2" />
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
            {readyBy ? new Date(readyBy).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            }) : 'Ready'}
          </div>
        </div>
        {/* EMI/Loan Info Row */}
        <div className="flex items-center gap-3 mt-2">
          <button 
            onClick={() => setEmiModalOpen(true)}
            className="bg-black/80 backdrop-blur text-white font-bold rounded-full px-4 py-1.5 text-sm shadow-sm flex items-center cursor-pointer hover:bg-black/90 transition-colors whitespace-nowrap" 
            style={{ minHeight: '2.25rem' }}
          >
            EMI starts at {emiAmount > 0 ? formatCurrency(emiAmount) : "Contact"}
          </button>
          <div className="text-xs text-black/60 font-medium whitespace-nowrap ml-2">
            Exclusive Home Loan deals
          </div>
        </div>
      </div>
      
      {/* EMI Calculator Modal */}
      <MobileEmiCalculatorModal 
        open={emiModalOpen}
        onClose={() => setEmiModalOpen(false)}
        propertyPrice={typeof price === 'number' ? price : undefined}
      />
    </div>
  );
} 