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
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('site_url, sitemap_schedule, sitemap_enabled, sitemap_include_properties, sitemap_include_users, sitemap_include_blog')
      .single()

    if (settingsError) {
      console.error('Error fetching sitemap settings:', settingsError)
      return NextResponse.json({ error: 'Failed to fetch sitemap settings' }, { status: 500 })
    }

    if (!settings?.site_url || !settings.sitemap_enabled) {
      return NextResponse.json({ message: 'Sitemap generation not enabled or site URL not configured' })
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
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, updated_at')
        .eq('status', 'active')  // Changed from 'published' to 'active'

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError)
      } else if (properties) {
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
      const { data: users, error: usersError } = await supabase
        .from('profiles')  // Changed from 'users' to 'profiles'
        .select('id, updated_at, is_public')
        .eq('is_public', true)

      if (usersError) {
        console.error('Error fetching users:', usersError)
      } else if (users) {
        users.forEach(user => {
          urls.push({
            url: {
              loc: `${baseUrl}/profile/${user.id}`,
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
      const { data: posts, error: postsError } = await supabase
        .from('blogs')  // Changed from 'blog_posts' to 'blogs'
        .select('id, updated_at, status')
        .eq('status', 'published')

      if (postsError) {
        console.error('Error fetching blog posts:', postsError)
      } else if (posts) {
        posts.forEach(post => {
          urls.push({
            url: {
              loc: `${baseUrl}/blogs/${post.id}`,
              lastmod: new Date(post.updated_at).toISOString(),
              changefreq: 'monthly',
              priority: '0.7'
            }
          })
        })
      }
    }

    // Generate sitemap XML - FIXED: Properly iterate through URLs
    const sitemap = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' })
      
    urls.forEach(urlData => {
      sitemap.ele('url')
        .ele('loc').txt(urlData.url.loc).up()
        .ele('lastmod').txt(urlData.url.lastmod).up()
        .ele('changefreq').txt(urlData.url.changefreq).up()
        .ele('priority').txt(urlData.url.priority).up()
        .up()
    })

    const sitemapXml = sitemap.end({ prettyPrint: true })

    // Upload the sitemap to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('sitemap')
      .upload('sitemap.xml', sitemapXml, { 
        upsert: true,
        contentType: 'application/xml'
      })

    if (uploadError) {
      console.error('Error uploading sitemap:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload sitemap to storage' },
        { status: 500 }
      )
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