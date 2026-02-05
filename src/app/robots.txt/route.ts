import { generateRobotsTxt } from '@/lib/seo'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const robotsContent = await generateRobotsTxt()
    
    return new NextResponse(robotsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating robots.txt:', error)
    
    // Return default robots.txt on error
    const defaultRobots = `User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://extrarealty.com'}/sitemap.xml`
    
    return new NextResponse(defaultRobots, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}
