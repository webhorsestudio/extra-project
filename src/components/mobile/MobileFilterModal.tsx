'use client'

import ModalHeader from './ModalHeader';
import SearchBar from './SearchBar';
// import LocationGrid from './LocationGrid';
import FilterRow from './FilterRow';
import ExploreButton from './ExploreButton';
import { useState, useEffect } from 'react';
import { MobileLocationData } from '@/lib/mobile-data';
import { getConfigurationDataClient } from '@/lib/configuration-data-client';
import { getBudgetDataClient, formatPrice } from '@/lib/budget-data';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const BEDROOM_IMAGE = '/images/bedroom-sofa.webp'; // Updated path

interface BudgetData {
  minPrice: number;
  maxPrice: number;
  step: number;
}

export default function MobileFilterModal({
  isOpen,
  onClose,
  city = 'Mumbai',
}: {
  isOpen: boolean;
  onClose: () => void;
  city?: string;
}) {
  const [activeDropdown, setActiveDropdown] = useState<null | 'location' | 'configuration' | 'budget'>('location');
  const [selectedLocation] = useState<string | null>(null);
  const [configurationData, setConfigurationData] = useState<{ bhkOptions: number[] }>({ bhkOptions: [0, 2, 3, 4, 5, 6] });
  const [selectedBedroom, setSelectedBedroom] = useState<string>('Any');
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 500000000]);
  const [minBudgetInput, setMinBudgetInput] = useState('');
  const [maxBudgetInput, setMaxBudgetInput] = useState('');

  // Location API state
  const [locations, setLocations] = useState<MobileLocationData[]>([]);

  const router = useRouter();

  // Fetch locations when modal opens
  useEffect(() => {
    if (isOpen && activeDropdown === 'location') {
      fetchLocations();
    }
  }, [isOpen, activeDropdown]);

  // Fetch configuration data
  useEffect(() => {
    if (isOpen && activeDropdown === 'configuration') {
      getConfigurationDataClient().then(data => {
        setConfigurationData(data);
      });
    }
  }, [isOpen, activeDropdown]);

  // Fetch budget data
  useEffect(() => {
    if (isOpen && activeDropdown === 'budget') {
      getBudgetDataClient().then(data => {
        setBudgetData(data);
        setBudgetRange([data.minPrice, data.maxPrice]);
        setMinBudgetInput(data.minPrice.toString());
        setMaxBudgetInput(data.maxPrice.toString());
      });
    }
  }, [isOpen, activeDropdown]);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/mobile/locations');
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      const data = await response.json();
      setLocations(data.locations || []);
    } catch {
      setLocations([]);
    }
  };

  // --- Configuration (Bedrooms) ---
  const bhkNumbers = configurationData.bhkOptions.filter(opt => opt > 0 && opt < 5);
  const hasFivePlus = configurationData.bhkOptions.some(opt => opt >= 5);
  const bedroomOptions = ['Any', ...bhkNumbers.map(opt => opt.toString()), ...(hasFivePlus ? ['5+'] : [])];

  const handleBedroomSelect = (option: string) => {
    setSelectedBedroom(option);
    setActiveDropdown('budget'); // Open budget dropdown automatically
  };

  // --- Budget ---
  const handleBudgetSlider = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = Number(e.target.value);
    if (type === 'min') {
      setBudgetRange([value, budgetRange[1]]);
      setMinBudgetInput(value.toString());
    } else {
      setBudgetRange([budgetRange[0], value]);
      setMaxBudgetInput(value.toString());
    }
  };

  const handleBudgetInput = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = Number(e.target.value);
    if (type === 'min') {
      setBudgetRange([value, budgetRange[1]]);
      setMinBudgetInput(e.target.value);
    } else {
      setBudgetRange([budgetRange[0], value]);
      setMaxBudgetInput(e.target.value);
    }
  };

  // --- Explore Button Handler ---
  const handleExplore = () => {
    const params = new URLSearchParams();
    if (selectedLocation) params.append('location', selectedLocation);
    if (selectedBedroom && selectedBedroom !== 'Any') params.append('bedrooms', selectedBedroom);
    if (budgetData) {
      if (budgetRange[0] > budgetData.minPrice) params.append('min_price', budgetRange[0].toString());
      if (budgetRange[1] < budgetData.maxPrice) params.append('max_price', budgetRange[1].toString());
    }
    onClose();
    router.push(`/m/properties?${params.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-40 transition-colors">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl mx-auto overflow-hidden relative animate-fadeIn max-h-[90vh] mt-6 flex flex-col">
        <ModalHeader city={city} view="summary" onClose={onClose} onBack={() => {}} />
        <div className="p-4 sm:p-6 space-y-5 bg-gray-50 flex-grow overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Location FilterRow and Dropdown */}
          <div className="rounded-2xl bg-white shadow-sm mb-2 transition-all">
            <FilterRow
              label="Location"
              value={selectedLocation ? locations.find(l => l.id === selectedLocation)?.name || '' : 'Any'}
              onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
            />
            {activeDropdown === 'location' && (
              <div className="mt-2 space-y-3 px-2 pb-3 transition-all duration-200">
                <SearchBar 
                  placeholder="Search for Locations / Developers / Projects" 
                  onSearch={() => {}} // Placeholder since searchQuery is not used
                />
                {/* <LocationGrid
                  locations={filteredLocations}
                  selected={selectedLocation}
                  onSelect={handleLocationSelect}
                  loading={locationsLoading}
                /> */}
              </div>
            )}
          </div>

          {/* Configuration (Bedrooms) FilterRow and Dropdown */}
          <div className="rounded-2xl bg-white shadow-sm mb-2 transition-all">
            <FilterRow
              label="Bedroom"
              value={selectedBedroom}
              onClick={() => setActiveDropdown(activeDropdown === 'configuration' ? null : 'configuration')}
            />
            {activeDropdown === 'configuration' && (
              <div className="mt-2 px-2 pb-3 transition-all duration-200">
                <div className="mb-2">
                  <div className="text-lg font-bold text-gray-900 mb-1">Bedroom</div>
                  <div className="text-sm text-gray-500 mb-2">Number of Bedrooms</div>
                  <div className="flex justify-center mb-4">
                    <Image src={BEDROOM_IMAGE} alt="Bedroom" width={120} height={60} className="object-contain" />
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {bedroomOptions.map((option) => (
                      <button
                        key={option}
                        className={`px-5 py-2 rounded-full border text-sm font-semibold transition-all
                          ${selectedBedroom === option ? 'bg-[#11182B] text-white border-[#11182B]' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-100'}`}
                        onClick={() => handleBedroomSelect(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Budget FilterRow and Dropdown */}
          <div className="rounded-2xl bg-white shadow-sm mb-2 transition-all">
            <FilterRow
              label="Budget"
              value={budgetData ? `${formatPrice(budgetRange[0])} - ${formatPrice(budgetRange[1])}` : 'Any'}
              onClick={() => setActiveDropdown(activeDropdown === 'budget' ? null : 'budget')}
            />
            {activeDropdown === 'budget' && budgetData && (
              <div className="mt-2 px-2 pb-3 transition-all duration-200">
                <div className="mb-2">
                  <div className="text-lg font-bold text-gray-900 mb-1">Budget</div>
                  <div className="text-sm text-gray-500 mb-2">Choose Price Range</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">{formatPrice(budgetData.minPrice)}</span>
                    <span className="text-xs text-gray-500">{formatPrice(budgetData.maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min={budgetData.minPrice}
                    max={budgetData.maxPrice}
                    step={budgetData.step}
                    value={budgetRange[0]}
                    onChange={e => handleBudgetSlider(e, 'min')}
                    className="w-full mb-2 accent-[#11182B]"
                  />
                  <input
                    type="range"
                    min={budgetData.minPrice}
                    max={budgetData.maxPrice}
                    step={budgetData.step}
                    value={budgetRange[1]}
                    onChange={e => handleBudgetSlider(e, 'max')}
                    className="w-full mb-2 accent-[#11182B]"
                  />
                  <div className="flex gap-4 mt-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                        placeholder={formatPrice(budgetData.minPrice)}
                        value={minBudgetInput}
                        min={budgetData.minPrice}
                        max={budgetRange[1]}
                        onChange={e => handleBudgetInput(e, 'min')}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                        placeholder={formatPrice(budgetData.maxPrice)}
                        value={maxBudgetInput}
                        min={budgetRange[0]}
                        max={budgetData.maxPrice}
                        onChange={e => handleBudgetInput(e, 'max')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0 left-0 right-0 z-10">
          <ExploreButton onClick={handleExplore} />
        </div>
      </div>
    </div>
  );
} 