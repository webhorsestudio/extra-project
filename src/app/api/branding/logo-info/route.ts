import { NextResponse } from 'next/server'
import { getLogoInfo } from '@/lib/branding-server'

export async function GET() {
  try {
    const logoInfo = await getLogoInfo()
    return NextResponse.json(logoInfo)
  } catch (error) {
    console.error('Unexpected error in logo info API:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 