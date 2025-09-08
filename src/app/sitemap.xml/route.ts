import { createSupabaseApiClient } from '@/lib/supabase/api'
import { create } from 'xmlbuilder2'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createSupabaseApiClient()
    
    // Get sitemap settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('site_url, sitemap_enabled, sitemap_include_properties, sitemap_include_blog')
      .single()

    if (settingsError || !settings?.site_url || !settings.sitemap_enabled) {
      return new NextResponse('Sitemap not available', { status: 404 })
    }

    const baseUrl = settings.site_url
    const urls: { url: { loc: string; lastmod: string; changefreq: string; priority: string } }[] = []

    // Add homepage
    urls.push({
      url: {
        loc: baseUrl,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '1.0'
      }
    })

    // Add public listings page
    urls.push({
      url: {
        loc: `${baseUrl}/public-listings`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '0.8'
      }
    })

    // Add properties if enabled
    if (settings.sitemap_include_properties) {
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, updated_at, status')
        .eq('status', 'active')

      if (!propertiesError && properties) {
        properties.forEach(property => {
          urls.push({
            url: {
              loc: `${baseUrl}/properties/${property.id}`,
              lastmod: new Date(property.updated_at).toISOString(),
              changefreq: 'weekly',
              priority: '0.8'
            }
          })
        })
      }

      // Add public listings if enabled
      const { data: publicListings, error: listingsError } = await supabase
        .from('public_listings')
        .select('slug, updated_at, status, expire_date')
        .eq('status', 'published')
        .or('expire_date.is.null,expire_date.gt.now()')

      if (!listingsError && publicListings) {
        publicListings.forEach(listing => {
          urls.push({
            url: {
              loc: `${baseUrl}/public-listings/${listing.slug}`,
              lastmod: new Date(listing.updated_at).toISOString(),
              changefreq: 'weekly',
              priority: '0.7'
            }
          })
        })
      }
    }

    // Add blog posts if enabled
    if (settings.sitemap_include_blog) {
      const { data: blogs, error: blogsError } = await supabase
        .from('blogs_with_categories')
        .select('slug, updated_at, status')
        .eq('status', 'published')

      if (!blogsError && blogs) {
        blogs.forEach(blog => {
          urls.push({
            url: {
              loc: `${baseUrl}/blog/${blog.slug}`,
              lastmod: new Date(blog.updated_at).toISOString(),
              changefreq: 'monthly',
              priority: '0.6'
            }
          })
        })
      }
    }

    // Generate XML sitemap
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' })

    urls.forEach(({ url }) => {
      const urlElement = root.ele('url')
      urlElement.ele('loc').txt(url.loc)
      urlElement.ele('lastmod').txt(url.lastmod)
      urlElement.ele('changefreq').txt(url.changefreq)
      urlElement.ele('priority').txt(url.priority)
    })

    const xml = root.end({ prettyPrint: true })

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
