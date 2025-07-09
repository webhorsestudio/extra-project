import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseApiClient } from '@/lib/supabase/api'

// GET: Fetch active footer logo settings
export async function GET() {
  try {
    // Auth check
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const adminSupabase = await createSupabaseAdminClient()
    const { data: logo, error } = await adminSupabase
      .from('footer_logo')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ logo: logo || null })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update active footer logo settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const adminSupabase = await createSupabaseAdminClient()
    const logoData = await request.json()
    
    // Get current active logo
    const { data: currentLogo } = await adminSupabase
      .from('footer_logo')
      .select('id')
      .eq('is_active', true)
      .single()
    
    if (!currentLogo) {
      return NextResponse.json({ error: 'No active logo found' }, { status: 404 })
    }
    
    // Update the current logo
    const { data, error } = await adminSupabase
      .from('footer_logo')
      .update({ ...logoData, updated_at: new Date().toISOString() })
      .eq('id', currentLogo.id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ logo: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Upload footer logo file
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 2MB.' }, { status: 400 })
    }
    
    const adminSupabase = await createSupabaseAdminClient()
    
    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `footer-logo-${timestamp}.${fileExtension}`
    const filePath = `footer-logos/${fileName}`
    
    // Upload file to Supabase Storage
    const { error: uploadError } = await adminSupabase.storage
      .from('branding')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }
    
    // Get public URL
    const { data: urlData } = adminSupabase.storage
      .from('branding')
      .getPublicUrl(filePath)
    
    // Update footer logo record
    const { data: currentLogo } = await adminSupabase
      .from('footer_logo')
      .select('id')
      .eq('is_active', true)
      .single()
    
    if (!currentLogo) {
      return NextResponse.json({ error: 'No active logo found' }, { status: 404 })
    }
    
    const { data, error } = await adminSupabase
      .from('footer_logo')
      .update({
        logo_url: urlData.publicUrl,
        logo_storage_path: filePath,
        logo_filename: file.name,
        logo_file_size: file.size,
        logo_mime_type: file.type,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentLogo.id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      logo: data,
      message: 'Logo uploaded successfully' 
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 