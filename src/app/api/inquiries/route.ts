import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function POST(req: NextRequest) {
  try {
    let formData: Record<string, string | File | null> = {}
    
    // Check if the request is FormData or JSON
    const contentType = req.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (for file uploads)
      const formDataObj = await req.formData()
      formData = {
        name: formDataObj.get('name') as string,
        email: formDataObj.get('email') as string,
        phone: formDataObj.get('phone') as string,
        subject: formDataObj.get('subject') as string,
        message: formDataObj.get('message') as string,
        priority: formDataObj.get('priority') as string || 'normal',
        category: formDataObj.get('category') as string || 'general',
        inquiry_type: formDataObj.get('inquiry_type') as string || 'contact',
        attachment: formDataObj.get('attachment') as File | null,
        property_id: formDataObj.get('property_id') as string || null,
        property_name: formDataObj.get('property_name') as string || null,
        property_location: formDataObj.get('property_location') as string || null,
        property_configurations: formDataObj.get('property_configurations') as string || null,
        property_price_range: formDataObj.get('property_price_range') as string || null,
        tour_date: formDataObj.get('tour_date') as string || null,
        tour_time: formDataObj.get('tour_time') as string || null,
        tour_type: formDataObj.get('tour_type') as string || null,
        tour_status: formDataObj.get('tour_status') as string || null,
      }
    } else {
      // Handle JSON (backward compatibility)
      formData = await req.json()
    }

    const { 
      name, 
      email, 
      phone, 
      subject, 
      message, 
      priority = 'normal', 
      category = 'general',
      inquiry_type = 'contact',
      attachment,
      property_id,
      property_name,
      property_location,
      property_configurations,
      property_price_range,
      tour_date,
      tour_time,
      tour_type,
      tour_status,
    } = formData

    // Validation
    if (!(name as string)?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!(email as string)?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!(message as string)?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const supabase = await createSupabaseApiClient()

    // Check if inquiries table exists
    const { error: tableError } = await supabase
      .from('inquiries')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('Table check error:', tableError)
      return NextResponse.json({ 
        error: 'Database not configured properly. Please contact support.',
        details: tableError.message 
      }, { status: 500 })
    }

    // Handle file upload if present
    let attachment_url = null
    if (attachment && attachment instanceof File) {
      try {
        const fileExt = attachment.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `inquiries/${inquiry_type}/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('inquiries')
          .upload(filePath, attachment)
        
        if (uploadError) {
          console.error('File upload error:', uploadError)
          // Continue without attachment if upload fails
        } else {
          const { data: urlData } = supabase.storage
            .from('inquiries')
            .getPublicUrl(filePath)
          attachment_url = urlData.publicUrl
        }
      } catch (uploadError) {
        console.error('File upload error:', uploadError)
        // Continue without attachment if upload fails
      }
    }

    // Insert the inquiry
    const { data, error: insertError } = await supabase
      .from('inquiries')
      .insert([
        {
          name: (name as string).trim(),
          email: (email as string).trim(),
          phone: (phone as string)?.trim() || null,
          subject: (subject as string)?.trim() || null,
          message: (message as string).trim(),
          priority,
          category,
          inquiry_type,
          status: 'unread',
          attachment_url,
          property_id: property_id || null,
          property_name: property_name || null,
          property_location: property_location || null,
          property_configurations: property_configurations || null,
          property_price_range: property_price_range || null,
          tour_date: tour_date || null,
          tour_time: tour_time || null,
          tour_type: tour_type || null,
          tour_status: tour_status || null,
        },
      ])
      .select()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ 
        error: 'Failed to submit enquiry. Please try again.',
        details: insertError.message 
      }, { status: 500 })
    }

    console.log('Enquiry submitted successfully:', data)

    return NextResponse.json({ 
      success: true, 
      message: 'Enquiry submitted successfully',
      data 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createSupabaseApiClient()
    
    // Check if table exists and get count
    const { data, error } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({ 
        error: 'Database not accessible',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'ok',
      tableExists: true,
      count: data?.length || 0
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Database check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 