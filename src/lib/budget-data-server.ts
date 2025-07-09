import { createSupabaseServerClientSafe } from '@/lib/supabase/server-fallback'

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

export async function getBudgetData(): Promise<BudgetData> {
  try {
    const supabase = await createSupabaseServerClientSafe()
    
    // Fetch price data from property_configurations table
    const { data: configurations, error: configurationsError } = await supabase
      .from('property_configurations')
      .select('price')
      .not('price', 'is', null)
      .gt('price', 0)
    
    if (configurationsError) {
      console.error('Error fetching price configurations:', configurationsError)
    }
    
    // Calculate price ranges based on actual data
    const prices = configurations?.map(c => c.price).filter(Boolean) || []
    
    let minPrice = 0
    let maxPrice = 50_00_00_000 // Default 50 Cr
    let step = 1_00_000 // Default 1 Lac step
    
    if (prices.length > 0) {
      const minActualPrice = Math.min(...prices)
      const maxActualPrice = Math.max(...prices)
      
      // Set min price to 0 or the lowest actual price (whichever is lower)
      minPrice = Math.min(0, minActualPrice)
      
      // Set max price to the highest actual price, rounded up to nearest crore
      maxPrice = Math.ceil(maxActualPrice / 1_00_00_000) * 1_00_00_000
      
      // Ensure max price is at least 50 Cr for good UX
      maxPrice = Math.max(maxPrice, 50_00_00_000)
      
      // Calculate step based on price range
      const priceRange = maxPrice - minPrice
      if (priceRange <= 1_00_00_000) { // 1 Cr or less
        step = 10_000 // 10K steps
      } else if (priceRange <= 10_00_00_000) { // 10 Cr or less
        step = 1_00_000 // 1 Lac steps
      } else {
        step = 10_00_000 // 10 Lac steps
      }
    }
    
    // Create predefined price ranges for better UX
    const priceRanges = [
      { label: 'Under 50 Lacs', min: 0, max: 50_00_000 },
      { label: '50 Lacs - 1 Cr', min: 50_00_000, max: 1_00_00_000 },
      { label: '1 Cr - 2 Cr', min: 1_00_00_000, max: 2_00_00_000 },
      { label: '2 Cr - 5 Cr', min: 2_00_00_000, max: 5_00_00_000 },
      { label: '5 Cr - 10 Cr', min: 5_00_00_000, max: 10_00_00_000 },
      { label: 'Above 10 Cr', min: 10_00_00_000, max: maxPrice }
    ]
    
    return {
      minPrice,
      maxPrice,
      step,
      priceRanges
    }
  } catch (error) {
    console.error('Error in getBudgetData:', error)
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