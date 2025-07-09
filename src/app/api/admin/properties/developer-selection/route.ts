import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth } from '@/lib/admin-data'

export async function GET() {
  try {
    console.log('Developer selection API: Starting request')
    
    // Check admin authentication
    const { user, error: authError } = await checkAdminAuth()
    if (authError || !user) {
      console.log('Developer selection API: Unauthorized - no user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Developer selection API: Admin authenticated, user:', user.id)

    // Get all active developers using service role client to bypass RLS
    const supabase = await createSupabaseAdminClient()
    console.log('Developer selection API: Created admin client')
    
    // First, let's check if the table exists by trying to get all developers
    const { data: allDevelopers, error: allError } = await supabase
      .from('property_developers')
      .select('*')
    
    console.log('Developer selection API: All developers query result:', { 
      count: allDevelopers?.length || 0, 
      error: allError?.message 
    })
    
    if (allError) {
      console.error('Developer selection API: Error accessing property_developers table:', allError)
      // Return empty array instead of error to prevent UI issues
      return NextResponse.json({ developers: [] })
    }
    
    // Now get only active developers
    const { data: developers, error } = await supabase
      .from('property_developers')
      .select('*')
      .eq('is_active', true)
      .order('name')

    console.log('Developer selection API: Active developers query result:', { 
      developersCount: developers?.length || 0, 
      error: error?.message 
    })

    if (error) {
      console.error('Developer selection API: Error fetching active developers:', error)
      // Return empty array instead of error to prevent UI issues
      return NextResponse.json({ developers: [] })
    }

    console.log('Developer selection API: Successfully fetched developers')
    return NextResponse.json({ developers: developers || [] })
  } catch (error) {
    console.error('Developer selection API: Unexpected error:', error)
    // Return empty array instead of error to prevent UI issues
    return NextResponse.json({ developers: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Developer selection API: Starting POST request')
    
    const { user, error: authError } = await checkAdminAuth()
    if (authError || !user) {
      console.log('Developer selection API: Unauthorized - no user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { propertyId, developerId, postedBy } = await request.json()
    console.log('Developer selection API: Request data:', { propertyId, developerId, postedBy })

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    // Update the property with developer information using service role client
    const supabase = await createSupabaseAdminClient()
    const updateData: Record<string, unknown> = {}
    
    if (developerId) {
      updateData.developer_id = developerId
      // If developerId is provided, get the developer name
      const { data: developer, error: developerError } = await supabase
        .from('property_developers')
        .select('name')
        .eq('id', developerId)
        .single()
      
      if (developerError) {
        console.error('Developer selection API: Error fetching developer:', developerError)
        return NextResponse.json({ error: 'Failed to fetch developer details' }, { status: 500 })
      }
      
      if (developer) {
        updateData.posted_by = developer.name
      }
    } else if (postedBy) {
      // If no developerId but postedBy is provided, clear developer_id and set posted_by
      updateData.developer_id = null
      updateData.posted_by = postedBy
    }

    console.log('Developer selection API: Updating property with data:', updateData)

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single()

    if (error) {
      console.error('Developer selection API: Error updating property:', error)
      return NextResponse.json({ 
        error: 'Failed to update property',
        details: error.message 
      }, { status: 500 })
    }

    console.log('Developer selection API: Property updated successfully')
    return NextResponse.json({ 
      success: true, 
      property: data,
      message: 'Property updated successfully' 
    })
  } catch (error) {
    console.error('Developer selection API: Unexpected error in POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 