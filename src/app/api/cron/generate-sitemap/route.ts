import { NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { create } from 'xmlbuilder2'

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createSupabaseApiClient()
    
    // Get sitemap settings
    const { data: settings } = await supabase
      .from('settings')
      .select('site_url, sitemap_schedule, sitemap_enabled, sitemap_include_properties, sitemap_include_users, sitemap_include_blog')
      .single()

    if (!settings?.site_url || !settings.sitemap_enabled) {
      return NextResponse.json({ message: 'Sitemap generation not enabled' })
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

    // Add properties if enabled
    if (settings.sitemap_include_properties) {
      const { data: properties } = await supabase
        .from('properties')
        .select('id, updated_at')
        .eq('status', 'published')

      if (properties) {
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
    }

    // Add users if enabled
    if (settings.sitemap_include_users) {
      const { data: users } = await supabase
        .from('users')
        .select('id, updated_at')
        .eq('is_public', true)

      if (users) {
        users.forEach(user => {
          urls.push({
            url: {
              loc: `${baseUrl}/users/${user.id}`,
              lastmod: new Date(user.updated_at).toISOString(),
              changefreq: 'weekly',
              priority: '0.6'
            }
          })
        })
      }
    }

    // Add blog posts if enabled
    if (settings.sitemap_include_blog) {
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, updated_at')
        .eq('status', 'published')

      if (posts) {
        posts.forEach(post => {
          urls.push({
            url: {
              loc: `${baseUrl}/blog/${post.id}`,
              lastmod: new Date(post.updated_at).toISOString(),
              changefreq: 'monthly',
              priority: '0.7'
            }
          })
        })
      }
    }

    // Generate sitemap XML
    const sitemap = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' })
      .ele(urls)
      .end({ prettyPrint: true })

    // Upload sitemap to storage
    const { error: uploadError } = await supabase
      .storage
      .from('public')
      .upload('sitemap.xml', sitemap, {
        contentType: 'application/xml',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Failed to upload sitemap: ${uploadError.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate sitemap' },
      { status: 500 }
    )
  }
} 