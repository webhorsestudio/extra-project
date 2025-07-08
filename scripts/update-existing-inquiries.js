const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateExistingInquiries() {
  try {
    console.log('Starting to update existing inquiries...')

    // First, let's see what inquiries exist
    const { data: existingInquiries, error: fetchError } = await supabase
      .from('inquiries')
      .select('*')

    if (fetchError) {
      console.error('Error fetching existing inquiries:', fetchError)
      return
    }

    console.log(`Found ${existingInquiries.length} existing inquiries`)

    // Update each inquiry with default values for new fields
    for (const inquiry of existingInquiries) {
      const updateData = {
        priority: inquiry.priority || 'normal',
        source: inquiry.source || 'website',
        subject: inquiry.subject || `${inquiry.inquiry_type} inquiry from ${inquiry.name}`,
        // Only update if these fields don't exist
        ...(inquiry.response_notes === undefined && { response_notes: null }),
        ...(inquiry.responded_at === undefined && { responded_at: null }),
        ...(inquiry.response_method === undefined && { response_method: null }),
        ...(inquiry.assigned_to === undefined && { assigned_to: null })
      }

      console.log(`Updating inquiry ${inquiry.id} with:`, updateData)

      const { error: updateError } = await supabase
        .from('inquiries')
        .update(updateData)
        .eq('id', inquiry.id)

      if (updateError) {
        console.error(`Error updating inquiry ${inquiry.id}:`, updateError)
      } else {
        console.log(`Successfully updated inquiry ${inquiry.id}`)
      }
    }

    console.log('Finished updating existing inquiries')

    // Verify the updates
    const { data: updatedInquiries, error: verifyError } = await supabase
      .from('inquiries')
      .select('*')
      .limit(5)

    if (verifyError) {
      console.error('Error verifying updates:', verifyError)
    } else {
      console.log('Sample of updated inquiries:', updatedInquiries)
    }

  } catch (error) {
    console.error('Error in updateExistingInquiries:', error)
  }
}

// Run the update
updateExistingInquiries() 