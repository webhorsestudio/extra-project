import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseAdminClient()
    
    const { data: category, error } = await supabase
      .from('faq_categories')
      .select(`
        *,
        faqs:faqs(count)
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Transform to include FAQ count
    const transformedCategory = {
      ...category,
      faq_count: category.faqs?.[0]?.count || 0
    }

    return NextResponse.json({ category: transformedCategory })

  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseAdminClient()
    const body = await request.json()
    
    const { name, description } = body

    // Validate required fields
    if (!name && description === undefined) {
      return NextResponse.json(
        { error: 'At least one field must be provided' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null

    // Generate new slug if name is being updated
    if (name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      
      // Check if slug already exists (excluding current category)
      const { data: existingCategory } = await supabase
        .from('faq_categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single()

      if (existingCategory) {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 400 }
        )
      }
      
      updateData.slug = slug
    }

    const { data: category, error } = await supabase
      .from('faq_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      category,
      message: 'Category updated successfully'
    })

  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseAdminClient()
    
    // Check if category has FAQs
    const { data: faqs, error: faqsError } = await supabase
      .from('faqs')
      .select('id')
      .eq('category_id', id)
      .limit(1)

    if (faqsError) {
      return NextResponse.json({ error: faqsError.message }, { status: 500 })
    }

    if (faqs && faqs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that contains FAQs. Please move or delete the FAQs first.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('faq_categories')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Category deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 