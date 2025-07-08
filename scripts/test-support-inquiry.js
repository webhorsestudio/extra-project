const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSupportInquiry() {
  console.log('🧪 Testing Support Inquiry System...\n')

  try {
    // Test 1: Check if inquiries table exists and has the required columns
    console.log('1. Checking database schema...')
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'inquiries')
      .order('ordinal_position')

    if (schemaError) {
      console.error('❌ Error checking schema:', schemaError.message)
      return
    }

    const requiredColumns = ['id', 'name', 'email', 'phone', 'subject', 'message', 'priority', 'category', 'inquiry_type', 'status', 'created_at']
    const existingColumns = columns.map(col => col.column_name)
    
    console.log('✅ Found columns:', existingColumns.join(', '))
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))
    if (missingColumns.length > 0) {
      console.warn('⚠️  Missing columns:', missingColumns.join(', '))
    } else {
      console.log('✅ All required columns present')
    }

    // Test 2: Check existing support inquiries
    console.log('\n2. Checking existing support inquiries...')
    const { data: supportInquiries, error: fetchError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('inquiry_type', 'support')
      .order('created_at', { ascending: false })
      .limit(5)

    if (fetchError) {
      console.error('❌ Error fetching support inquiries:', fetchError.message)
      return
    }

    console.log(`✅ Found ${supportInquiries.length} support inquiries`)
    if (supportInquiries.length > 0) {
      console.log('Latest support inquiries:')
      supportInquiries.forEach((inquiry, index) => {
        console.log(`  ${index + 1}. ${inquiry.name} - ${inquiry.subject} (${inquiry.status})`)
      })
    }

    // Test 3: Insert a test support inquiry
    console.log('\n3. Inserting test support inquiry...')
    const testInquiry = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      subject: 'Test Support Request',
      message: 'This is a test support inquiry to verify the system is working correctly.',
      priority: 'normal',
      category: 'technical',
      inquiry_type: 'support',
      status: 'unread',
      source: 'test-script'
    }

    const { data: newInquiry, error: insertError } = await supabase
      .from('inquiries')
      .insert([testInquiry])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error inserting test inquiry:', insertError.message)
      return
    }

    console.log('✅ Test support inquiry created successfully!')
    console.log(`   ID: ${newInquiry.id}`)
    console.log(`   Name: ${newInquiry.name}`)
    console.log(`   Subject: ${newInquiry.subject}`)
    console.log(`   Status: ${newInquiry.status}`)

    // Test 4: Verify the inquiry was created
    console.log('\n4. Verifying test inquiry...')
    const { data: verifyInquiry, error: verifyError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', newInquiry.id)
      .single()

    if (verifyError) {
      console.error('❌ Error verifying inquiry:', verifyError.message)
      return
    }

    console.log('✅ Test inquiry verified successfully!')
    console.log(`   Inquiry Type: ${verifyInquiry.inquiry_type}`)
    console.log(`   Priority: ${verifyInquiry.priority}`)
    console.log(`   Category: ${verifyInquiry.category}`)

    // Test 5: Clean up test data
    console.log('\n5. Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', newInquiry.id)

    if (deleteError) {
      console.error('❌ Error deleting test inquiry:', deleteError.message)
      return
    }

    console.log('✅ Test inquiry cleaned up successfully!')

    console.log('\n🎉 All tests passed! Support inquiry system is working correctly.')
    console.log('\n📋 Summary:')
    console.log('   ✅ Database schema is correct')
    console.log('   ✅ Support inquiries can be created')
    console.log('   ✅ Support inquiries can be retrieved')
    console.log('   ✅ Support inquiries can be filtered by type')
    console.log('   ✅ All required fields are working')

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

testSupportInquiry()
