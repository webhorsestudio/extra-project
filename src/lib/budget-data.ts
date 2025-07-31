export interface BudgetData {
  minPrice: number
  maxPrice: number
  step: number
  priceRanges: {
    label: string
    min: number
    max: number
  }[]
}

// Client-side function for fetching budget data
export async function getBudgetDataClient(): Promise<BudgetData> {
  try {
    const response = await fetch('/api/budget', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.budget
  } catch {
    // Return default values if there's an error
    return {
      minPrice: 0,
      maxPrice: 50_00_00_000,
      step: 1_00_000,
      priceRanges: [
        { label: 'Under 50 Lacs', min: 0, max: 50_00_000 },
        { label: '50 Lacs - 1 Cr', min: 50_00_000, max: 1_00_00_000 },
        { label: '1 Cr - 2 Cr', min: 1_00_00_000, max: 2_00_00_000 },
        { label: '2 Cr - 5 Cr', min: 2_00_00_000, max: 5_00_00_000 },
        { label: '5 Cr - 10 Cr', min: 5_00_00_000, max: 10_00_00_000 },
        { label: 'Above 10 Cr', min: 10_00_00_000, max: 50_00_00_000 }
      ]
    }
  }
}

// Utility functions for price formatting
export const formatPrice = (value: number): string => {
  if (value >= 1_00_00_000) {
    return `₹${(value / 1_00_00_000).toFixed(1)} Cr`
  }
  if (value >= 1_00_000) {
    return `₹${(value / 1_00_000).toFixed(1)} Lac`
  }
  return `₹${value.toLocaleString('en-IN')}`
}

export const formatPriceInLacs = (value: number): number => {
  return Math.round(value / 1_00_000)
}

export const parsePriceFromLacs = (lacs: number): number => {
  return lacs * 1_00_000
} 