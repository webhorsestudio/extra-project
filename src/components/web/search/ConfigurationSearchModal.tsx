'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { ConfigurationData } from '@/lib/configuration-data-client'

interface ConfigurationSearchModalProps {
  onClose: () => void;
  onConfigurationSelect?: (config: { type: string; bhk?: string }) => void;
  configurationData?: ConfigurationData;
}

// Fallback arrays if no configuration data is provided
const fallbackPropertyTypes = ['Any', 'Apartment', 'House', 'Villa', 'Penthouse', 'Commercial'];
const fallbackBedroomOptions = ['Any', '1', '2', '3', '4', '5', '5+'];

export default function ConfigurationSearchModal({ 
  onClose, 
  onConfigurationSelect,
  configurationData 
}: ConfigurationSearchModalProps) {
  const [selectedType, setSelectedType] = useState('Any');
  const [selectedBedroom, setSelectedBedroom] = useState('Any');
  const router = useRouter();

  // Use configuration data if available, otherwise use fallback
  const propertyTypes = configurationData?.propertyTypes || fallbackPropertyTypes;
  const bedroomOptions = configurationData?.bhkOptions 
    ? ['Any', ...configurationData.bhkOptions.slice(1).map(bhk => bhk.toString())]
    : fallbackBedroomOptions;



  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    // Only add event listener on client side
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [onClose]);

  const handleApply = () => {
    if (onConfigurationSelect) {
      onConfigurationSelect({
        type: selectedType,
        bhk: selectedBedroom !== 'Any' ? selectedBedroom : undefined
      });
    } else {
      // Default behavior: navigate to properties page with configuration filter
      const params = new URLSearchParams();
      if (selectedType !== 'Any') {
        params.append('type', selectedType);
      }
      if (selectedBedroom !== 'Any') {
        params.append('bhk', selectedBedroom);
      }
              router.push(`/properties?${params.toString()}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-sm z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center pr-12">Select Configuration</h2>
        
        {/* Property Type */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Property Type</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                  selectedType === type
                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Bedroom options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Bedrooms</h3>
          <div className="flex flex-wrap gap-3">
            {bedroomOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedBedroom(option)}
                className={cn(
                  'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                  selectedBedroom === option
                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700'
                )}
              >
                {option} BHK
              </button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex justify-center">
          <button
            onClick={handleApply}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
} 