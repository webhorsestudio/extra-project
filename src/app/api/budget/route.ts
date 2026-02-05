import { NextResponse } from 'next/server'
import { getBudgetData } from '@/lib/budget-data-server'

export async function GET() {
  try {
    console.log('Budget API: Fetching budget data...')
    
    const budgetData = await getBudgetData()
    
    console.log('Budget API: Budget data fetched successfully:', {
      minPrice: budgetData.minPrice,
      maxPrice: budgetData.maxPrice,
      step: budgetData.step,
      priceRangesCount: budgetData.priceRanges.length
    })
    
    return NextResponse.json({
      budget: budgetData,
      success: true
    })
  } catch (error) {
    console.error('Budget API: Error fetching budget data:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to fetch budget data',
        success: false
      },
      { status: 500 }
    )
  }
} 