import { NextResponse } from 'next/server'
import { getLogoImage } from '@/lib/branding-server'

export async function GET() {
  try {
    const { imageBuffer, contentType, error } = await getLogoImage()

    if (error) {
      console.log('Logo API: No logo configured or error occurred:', error)
      return new NextResponse('Logo not configured', { status: 404 })
    }

    if (!imageBuffer || !contentType) {
      console.log('Logo API: No image buffer or content type')
      return new NextResponse('Logo not found', { status: 404 })
    }

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Unexpected error in logo API:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 