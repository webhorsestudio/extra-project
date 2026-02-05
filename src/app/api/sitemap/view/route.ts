import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
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

    // Get sitemap settings to check if enabled
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

    if (!settings?.sitemap_enabled) {
      return NextResponse.json({
        content: 'Sitemap generation is disabled. Please enable it in settings first.',
        url: '',
        exists: false,
        message: 'Sitemap generation is disabled'
      })
    }

    // First check if the sitemap file exists
    const { data: fileList, error: listError } = await supabase
      .storage
      .from('sitemap')
      .list('', {
        limit: 100,
        offset: 0,
        search: 'sitemap.xml'
      })

    if (listError) {
      console.error('Error listing storage files:', listError)
      return NextResponse.json({
        content: 'Error checking storage. Please try again.',
        url: '',
        exists: false,
        message: 'Storage error'
      })
    }

    // Check if sitemap.xml exists
    const sitemapExists = fileList.some(file => file.name === 'sitemap.xml')
    
    if (!sitemapExists) {
      return NextResponse.json({
        content: 'No sitemap found. Please generate a sitemap first using the "Generate Now" button above.',
        url: '',
        exists: false,
        message: 'No sitemap found'
      })
    }

    // Try to download the sitemap from storage
    const { data: sitemapData, error: downloadError } = await supabase
      .storage
      .from('sitemap')
      .download('sitemap.xml')

    if (downloadError) {
      console.error('Error downloading sitemap:', downloadError)
      return NextResponse.json({
        content: 'Error downloading sitemap. Please try generating a new one.',
        url: '',
        exists: false,
        message: 'Download error'
      })
    }

    // Convert the blob to text
    const sitemapContent = await sitemapData.text()

    // Get the public URL for the sitemap
    const { data: sitemapUrl } = supabase
      .storage
      .from('sitemap')
      .getPublicUrl('sitemap.xml')

    return NextResponse.json({
      content: sitemapContent,
      url: sitemapUrl.publicUrl,
      exists: true,
      lastModified: new Date().toISOString(),
      message: 'Sitemap loaded successfully'
    })

  } catch (error) {
    console.error('Error viewing sitemap:', error)
    return NextResponse.json({
      content: 'Unexpected error occurred. Please try again.',
      url: '',
      exists: false,
      message: 'Unexpected error'
    })
  }
}
