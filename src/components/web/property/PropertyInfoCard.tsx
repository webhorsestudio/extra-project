"use client";
import React, { useState } from 'react';
import { Send, MapPin, BedDouble, Ruler, Calendar, Copy, MessageCircle } from 'lucide-react';
import { Property } from '@/types/property';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import EmiCalculatorModal from './EmiCalculatorModal';

interface PropertyInfoCardProps {
  property: Property;
}

// Helper function to format price
const formatPrice = (price: number) => {
  if (price >= 10000000) {
    return `${(price / 10000000).toFixed(1)} Cr`;
  } else if (price >= 100000) {
    return `${(price / 100000).toFixed(1)} L`;
  } else {
    return price.toLocaleString();
  }
}

// Helper function to calculate EMI
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
}

export default function PropertyInfoCard({ property }: PropertyInfoCardProps) {
  const { toast } = useToast();
  const [emiOpen, setEmiOpen] = useState(false);
  // Get the lowest price from configurations
  const priceList = property.property_configurations
    ? property.property_configurations.map(config => config.price).filter(price => price > 0)
    : [];
  const lowestPrice = priceList.length > 0 ? Math.min(...priceList) : 0;

  // Get the first configuration for area and bedroom info
  const firstConfig = property.property_configurations && property.property_configurations.length > 0
    ? property.property_configurations[0]
    : null;

  // Calculate EMI
  const emiAmount = lowestPrice > 0 ? calculateEMI(lowestPrice) : 0;

  // Share logic
  const url = typeof window !== 'undefined' ? window.location.origin + '/web/properties/' + (property.slug || property.id) : '';
  const config = property.property_configurations?.[0];
  const beds = config?.bedrooms || config?.bhk || '—';

  const handleCopy = async () => {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'The property link has been copied to your clipboard.'
      });
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${property.title} (${beds} Beds)\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg px-8 py-6 mt-4 w-full max-w-full">
      {/* Top Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-2xl md:text-3xl font-bold text-[#1a2236]">
          {lowestPrice > 0 ? `Starts At ₹${formatPrice(lowestPrice)}` : 'Price available on request'}
        </div>
        <div className="flex items-center gap-6 md:gap-8 text-[#1a2236] text-base font-medium">
          {/* Share Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:text-blue-700 transition-colors" type="button">
                <Send className="h-5 w-5" />
                <span>Share</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <div className="flex flex-col gap-3">
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-[#1a2236]"
                  onClick={handleCopy}
                  type="button"
                >
                  <Copy className="h-5 w-5" /> Copy Link
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 transition text-[#1a2236]"
                  onClick={handleWhatsApp}
                  type="button"
                >
                  <MessageCircle className="h-5 w-5 text-green-600" /> WhatsApp
                </button>
              </div>
            </PopoverContent>
          </Popover>
          {/* Wishlist Button */}
          <FavoriteButton propertyId={property.id} initialIsFavorited={false} />
        </div>
      </div>
      {/* Divider */}
      <div className="my-4 border-t border-gray-200" />
      {/* Bottom Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Title and Details */}
        <div>
          <div className="text-xl md:text-2xl font-bold text-[#1a2236] mb-2">{property.title}</div>
          <div className="flex flex-wrap items-center gap-5 text-[#1a2236] text-base font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="h-5 w-5 text-blue-700" />
              {property.location_data?.name || property.location}
            </span>
            {firstConfig && (
              <>
                <span className="flex items-center gap-1">
                  <BedDouble className="h-5 w-5 text-blue-700" />
                  {firstConfig.bhk} BHK
                </span>
                <span className="flex items-center gap-1">
                  <Ruler className="h-5 w-5 text-blue-700" />
                  {firstConfig.area} Sq. Ft.
                </span>
              </>
            )}
            {firstConfig?.ready_by && (
              <span className="flex items-center gap-1">
                <Calendar className="h-5 w-5 text-blue-700" />
                {new Date(firstConfig.ready_by).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </span>
            )}
          </div>
        </div>
        {/* Right: EMI Button */}
        {emiAmount > 0 && (
          <div className="flex flex-col items-end gap-1 min-w-[200px]">
            <button className="bg-[#1a2236] text-white text-base font-semibold px-7 py-3 rounded-2xl shadow hover:bg-blue-900 transition-colors w-full text-center" onClick={() => setEmiOpen(true)}>
              EMI starts at ₹{formatPrice(emiAmount)}
            </button>
            <span className="text-xs text-gray-500 mt-1">Exclusive Home Loan deals</span>
            <EmiCalculatorModal open={emiOpen} onClose={() => setEmiOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
} 