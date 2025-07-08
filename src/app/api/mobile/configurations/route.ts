import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createSupabaseAdminClient()
    
    // Fetch property configurations for mobile filter modal
    const { data: configurations, error: configError } = await supabase
      .from('property_configurations')
      .select(`
        id,
        bhk,
        property_type,
        price,
        area
      `)
      .eq('is_active', true)
    
    if (configError) {
      console.error('Error fetching mobile configurations:', configError)
      return NextResponse.json({ error: configError.message }, { status: 500 })
    }

    // Extract unique BHK options
    const bhkOptions = [...new Set(configurations?.map((config: any) => config.bhk) || [])]
      .filter(bhk => bhk && bhk > 0)
      .sort((a, b) => a - b)
      .map(bhk => ({ value: bhk, label: `${bhk} BHK` }))

    // Extract unique property types
    const propertyTypes = [...new Set(configurations?.map((config: any) => config.property_type) || [])]
      .filter(type => type)
      .sort()
      .map(type => ({ value: type, label: type }))

    // Calculate price ranges for budget filter
    const prices = configurations?.map((config: any) => config.price) || []
    const validPrices = prices.filter(price => price && price > 0)
    
    let priceRanges: Array<{ value: string; label: string; min: number; max: number | null }> = []
    if (validPrices.length > 0) {
      const minPrice = Math.min(...validPrices)
      const maxPrice = Math.max(...validPrices)
      
      // Create price range buckets (in Lacs)
      const minLacs = Math.floor(minPrice / 100000)
      const maxLacs = Math.ceil(maxPrice / 100000)
      
      priceRanges = [
        { value: '0-50', label: 'Under 50 Lacs', min: 0, max: 5000000 },
        { value: '50-100', label: '50 Lacs - 1 Cr', min: 5000000, max: 10000000 },
        { value: '100-200', label: '1 Cr - 2 Cr', min: 10000000, max: 20000000 },
        { value: '200+', label: 'Above 2 Cr', min: 20000000, max: null }
      ]
    }
    
    return NextResponse.json({
      bhk_options: bhkOptions,
      property_types: propertyTypes,
      price_ranges: priceRanges,
      total_configurations: configurations?.length || 0
    })
  } catch (error) {
    console.error('Unexpected error in mobile configurations API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 