const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkBlogSchema() {
  try {
    console.log('🔍 Checking blog schema...')
    
    // Check the blogs_with_categories view
    const { data: viewData, error: viewError } = await supabase
      .from('blogs_with_categories')
      .select('*')
      .limit(1)
    
    if (viewError) {
      console.error('❌ Error accessing blogs_with_categories view:', viewError)
      return
    }
    
    if (viewData && viewData.length > 0) {
      console.log('✅ blogs_with_categories view schema:')
      console.log(JSON.stringify(viewData[0], null, 2))
    } else {
      console.log('⚠️  No data found in blogs_with_categories view')
    }
    
    // Check the original blogs table
    const { data: tableData, error: tableError } = await supabase
      .from('blogs')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error accessing blogs table:', tableError)
      return
    }
    
    if (tableData && tableData.length > 0) {
      console.log('\n✅ blogs table schema:')
      console.log(JSON.stringify(tableData[0], null, 2))
    } else {
      console.log('⚠️  No data found in blogs table')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkBlogSchema() 