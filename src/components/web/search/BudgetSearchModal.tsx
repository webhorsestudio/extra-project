'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { BudgetData, formatPrice, formatPriceInLacs, getBudgetDataClient } from '@/lib/budget-data'

interface BudgetSearchModalProps {
  onClose: () => void;
  onBudgetSelect?: (budget: { min?: number; max?: number }) => void;
  budgetData?: BudgetData;
}

export default function BudgetSearchModal({ onClose, onBudgetSelect, budgetData }: BudgetSearchModalProps) {
  const [range, setRange] = useState([0, 50_00_00_000]); // Default values
  const [localBudgetData, setLocalBudgetData] = useState<BudgetData | null>(null)
  const [isLoading, setIsLoading] = useState(!budgetData)
  const router = useRouter();

  // Use provided budgetData or fetch it client-side
  const currentBudgetData = budgetData || localBudgetData

  useEffect(() => {
    if (budgetData) {
      // Use SSR data
      setRange([budgetData.minPrice, budgetData.maxPrice])
      setIsLoading(false)
    } else {
      // Fetch data client-side
      const fetchBudgetData = async () => {
        try {
          const data = await getBudgetDataClient()
          setLocalBudgetData(data)
          setRange([data.minPrice, data.maxPrice])
        } catch (error) {
          // Keep default values
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchBudgetData()
    }
  }, [budgetData])

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
    if (!currentBudgetData) return

    if (onBudgetSelect) {
      const budget = {
        min: range[0] > currentBudgetData.minPrice ? formatPriceInLacs(range[0]) : undefined,
        max: range[1] < currentBudgetData.maxPrice ? formatPriceInLacs(range[1]) : undefined
      };
      onBudgetSelect(budget);
    } else {
      // Default behavior: navigate to properties page with budget filter
      const params = new URLSearchParams();
      if (range[0] > currentBudgetData.minPrice) {
        params.append('min_price', formatPriceInLacs(range[0]).toString());
      }
      if (range[1] < currentBudgetData.maxPrice) {
        params.append('max_price', formatPriceInLacs(range[1]).toString());
      }
              router.push(`/properties?${params.toString()}`);
    }
    onClose();
  };

  const handleRangeSelect = (min: number, max: number) => {
    setRange([min, max])
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading budget options...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentBudgetData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
          <div className="text-center">
            <p className="text-red-600">Failed to load budget options</p>
            <button
              onClick={onClose}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-sm z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center pr-12">Select Budget</h2>
        
        {/* Current Range Display */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-blue-600">
            {formatPrice(range[0])} - {formatPrice(range[1])}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatPriceInLacs(range[0])}L - {formatPriceInLacs(range[1])}L
          </div>
        </div>
        
        {/* Quick Range Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Select</h3>
          <div className="grid grid-cols-2 gap-2">
            {currentBudgetData.priceRanges.map((priceRange, index) => (
              <button
                key={index}
                onClick={() => handleRangeSelect(priceRange.min, priceRange.max)}
                className={`p-2 text-xs rounded-lg border transition-colors ${
                  range[0] === priceRange.min && range[1] === priceRange.max
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {priceRange.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Slider */}
        <div className="mb-6">
          <Slider
            min={currentBudgetData.minPrice}
            max={currentBudgetData.maxPrice}
            step={currentBudgetData.step}
            value={range}
            onValueChange={setRange}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>{formatPrice(currentBudgetData.minPrice)}</span>
            <span>{formatPrice(currentBudgetData.maxPrice)}</span>
          </div>
        </div>
        
        {/* Min/Max Inputs */}
        <div className="flex items-center gap-4 justify-center mb-6">
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500 mb-1">Min (Lacs)</label>
            <input
              type="number"
              className="w-28 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              value={formatPriceInLacs(range[0])}
              min={formatPriceInLacs(currentBudgetData.minPrice)}
              max={formatPriceInLacs(range[1])}
              onChange={e => {
                const value = Number(e.target.value) * 1_00_000;
                setRange([value, range[1]]);
              }}
            />
          </div>
          <span className="text-gray-400 font-bold">—</span>
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500 mb-1">Max (Lacs)</label>
            <input
              type="number"
              className="w-28 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              value={formatPriceInLacs(range[1])}
              min={formatPriceInLacs(range[0])}
              max={formatPriceInLacs(currentBudgetData.maxPrice)}
              onChange={e => {
                const value = Number(e.target.value) * 1_00_000;
                setRange([range[0], value]);
              }}
            />
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex justify-center">
          <button
            onClick={handleApply}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Apply Budget
          </button>
        </div>
      </div>
    </div>
  )
} 