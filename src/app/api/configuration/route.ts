import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient()
    
    // Fetch unique property types from properties table
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('property_type')
      .eq('status', 'active')
      .not('property_type', 'is', null)
    
    if (propertiesError) {
      console.error('Error fetching property types:', propertiesError)
      return NextResponse.json({ error: propertiesError.message }, { status: 500 })
    }
    
    // Fetch unique BHK values from property_configurations table
    const { data: configurations, error: configurationsError } = await supabase
      .from('property_configurations')
      .select('bhk')
      .not('bhk', 'is', null)
    
    if (configurationsError) {
      console.error('Error fetching BHK configurations:', configurationsError)
      return NextResponse.json({ error: configurationsError.message }, { status: 500 })
    }
    
    // Extract unique property types
    const propertyTypes = properties 
      ? [...new Set(properties.map(p => p.property_type).filter(Boolean))].sort()
      : []
    
    // Extract unique BHK values
    const bhkOptions = configurations 
      ? [...new Set(configurations.map(c => c.bhk).filter(Boolean))].sort((a, b) => a - b)
      : []
    
    const configuration = {
      propertyTypes: ['Any', ...propertyTypes],
      bhkOptions: [0, ...bhkOptions] // 0 represents "Any"
    }
    
    return NextResponse.json({ configuration })
  } catch (error) {
    console.error('Error in configuration API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 