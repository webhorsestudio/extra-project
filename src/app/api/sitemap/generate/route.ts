import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { create } from 'xmlbuilder2'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseApiClient()

  try {
    // Check if we're in development mode and allow bypass
    const isDevelopment = process.env.NODE_ENV === 'development'
    const bypassAuth = request.headers.get('x-bypass-auth') === 'true'
    
    if (!isDevelopment || !bypassAuth) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // Check if the current user has admin role
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !currentUserProfile || currentUserProfile.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin privileges required' },
          { status: 403 }
        )
      }
    }

    // Get request body for sitemap configuration
    const { include_properties = true, include_users = false, include_blog = true } = await request.json()

    // Get sitemap settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('site_url, sitemap_enabled')
      .single()

    if (settingsError) {
      console.error('Error fetching settings:', settingsError)
      return NextResponse.json(
        { error: 'Failed to fetch sitemap settings' },
        { status: 500 }
      )
    }

    if (!settings?.site_url) {
      return NextResponse.json(
        { error: 'Site URL not configured. Please set the site URL in settings first.' },
        { status: 400 }
      )
    }

    if (!settings.sitemap_enabled) {
      return NextResponse.json(
        { error: 'Sitemap generation is disabled. Please enable it in settings first.' },
        { status: 400 }
      )
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
    if (include_properties) {
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, updated_at, status')
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
    if (include_users) {
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
    if (include_blog) {
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

    // Add other important pages
    const staticPages = [
      { path: '/properties', priority: '0.9', changefreq: 'daily' },
      { path: '/blogs', priority: '0.8', changefreq: 'weekly' },
      { path: '/contact', priority: '0.6', changefreq: 'monthly' },
      { path: '/faqs', priority: '0.6', changefreq: 'monthly' },
      { path: '/support', priority: '0.6', changefreq: 'monthly' },
      { path: '/privacy', priority: '0.4', changefreq: 'yearly' },
      { path: '/terms', priority: '0.4', changefreq: 'yearly' }
    ]

    staticPages.forEach(page => {
      urls.push({
        url: {
          loc: `${baseUrl}${page.path}`,
          lastmod: new Date().toISOString(),
          changefreq: page.changefreq,
          priority: page.priority
        }
      })
    })

    // Generate sitemap XML
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

    // Get the public URL for the sitemap
    const { data: sitemapUrl } = supabase.storage
      .from('sitemap')
      .getPublicUrl('sitemap.xml')

    console.log(`Sitemap generated successfully with ${urls.length} URLs`)
    console.log(`Sitemap URL: ${sitemapUrl.publicUrl}`)

    return NextResponse.json({
      success: true,
      message: 'Sitemap generated successfully',
      urlCount: urls.length,
      sitemapUrl: sitemapUrl.publicUrl,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate sitemap' },
      { status: 500 }
    )
  }
} 