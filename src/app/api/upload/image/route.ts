import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient()
    
    // Parse the form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`
    
    // Convert File to Buffer for Supabase upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload file to images bucket
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })
    
    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ 
        error: `Upload failed: ${uploadError.message}` 
      }, { status: 500 })
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)
    
    if (!urlData?.publicUrl) {
      return NextResponse.json({ 
        error: 'Failed to generate public URL' 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      url: urlData.publicUrl,
      path: fileName,
      filename: file.name,
      size: file.size,
      type: file.type
    })
    
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 })
  }
}
