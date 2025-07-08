import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient()
    
    // Parse the form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string
    const fileName = formData.get('fileName') as string
    
    if (!file || !bucket || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Convert File to Buffer for Supabase upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload file using service role client (bypasses RLS)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })
    
    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    
    return NextResponse.json({
      url: urlData.publicUrl,
      path: fileName
    })
    
  } catch (error) {
    console.error('Logo upload error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 })
  }
} 