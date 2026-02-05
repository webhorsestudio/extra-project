import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
// Import directly from service to avoid module resolution issues
import { analyzeStructuredData } from '@/lib/seo/structured-data/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseAdminClient()

    // Fetch and analyze structured data
    const structuredDataResults = await analyzeStructuredData(url)

    // Store results in database (without status column for now)
    const { data: testData, error: testError } = await supabase
      .from('seo_test_results')
      .insert({
        test_type: 'structured_data',
        url: url,
        result_data: structuredDataResults,
        success: true,
        message: 'Structured data validation completed successfully',
        test_timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (testError) {
      console.error('Error storing structured data test results:', testError)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...structuredDataResults,
        testId: testData?.id,
        timestamp: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Error analyzing structured data:', error)
    return NextResponse.json(
      { error: 'Failed to analyze structured data' },
      { status: 500 }
    )
  }
}

