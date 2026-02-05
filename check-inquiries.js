const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkInquiries() {
  console.log('Checking inquiries data...\n')

  // Get all inquiries
  const { data: allInquiries, error: allError } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  if (allError) {
    console.error('Error fetching all inquiries:', allError)
    return
  }

  console.log(`Total inquiries in database: ${allInquiries.length}\n`)

  // Check property inquiries view
  const { data: propertyInquiries, error: propertyError } = await supabase
    .from('property_inquiries_view')
    .select('*')

  if (propertyError) {
    console.error('Error fetching property inquiries:', propertyError)
    return
  }

  console.log(`Inquiries in property_inquiries_view: ${propertyInquiries.length}\n`)

  // Check tour bookings view
  const { data: tourBookings, error: tourError } = await supabase
    .from('tour_bookings_view')
    .select('*')

  if (tourError) {
    console.error('Error fetching tour bookings:', tourError)
    return
  }

  console.log(`Inquiries in tour_bookings_view: ${tourBookings.length}\n`)

  // Show details of each inquiry
  console.log('=== ALL INQUIRIES ===')
  allInquiries.forEach((inquiry, index) => {
    console.log(`${index + 1}. ID: ${inquiry.id}`)
    console.log(`   Name: ${inquiry.name}`)
    console.log(`   Email: ${inquiry.email}`)
    console.log(`   Type: ${inquiry.inquiry_type}`)
    console.log(`   Status: ${inquiry.status}`)
    console.log(`   Property Configurations: ${inquiry.property_configurations || 'null'}`)
    console.log(`   Property Name: ${inquiry.property_name || 'null'}`)
    console.log(`   Tour Date: ${inquiry.tour_date || 'null'}`)
    console.log(`   Tour Time: ${inquiry.tour_time || 'null'}`)
    console.log(`   Created: ${inquiry.created_at}`)
    console.log('')
  })

  // Show which inquiries are in property view
  console.log('=== IN PROPERTY INQUIRIES VIEW ===')
  propertyInquiries.forEach((inquiry, index) => {
    console.log(`${index + 1}. ID: ${inquiry.id}`)
    console.log(`   Name: ${inquiry.name}`)
    console.log(`   Type: ${inquiry.inquiry_type}`)
    console.log(`   Property Configurations: ${inquiry.property_configurations || 'null'}`)
    console.log('')
  })

  // Show which inquiries are in tour view
  console.log('=== IN TOUR BOOKINGS VIEW ===')
  tourBookings.forEach((inquiry, index) => {
    console.log(`${index + 1}. ID: ${inquiry.id}`)
    console.log(`   Name: ${inquiry.name}`)
    console.log(`   Type: ${inquiry.inquiry_type}`)
    console.log(`   Tour Date: ${inquiry.tour_date || 'null'}`)
    console.log(`   Tour Time: ${inquiry.tour_time || 'null'}`)
    console.log('')
  })
}

checkInquiries().catch(console.error) 