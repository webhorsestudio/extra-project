const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testBlogFetch() {
  console.log('Testing blog data fetching...')

  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('id, title, excerpt, featured_image, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error fetching blogs:', error)
      return
    }

    console.log('Raw data from Supabase:', data)

    // Map the data to match the expected schema (same as in getLatestBlogs)
    const mappedBlogs = (data || []).map(blog => ({
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      featured_image: blog.featured_image,
      created_at: blog.created_at
    }))

    console.log('\nMapped blog data:')
    mappedBlogs.forEach((blog, index) => {
      console.log(`\n${index + 1}. ${blog.title}`)
      console.log(`   Featured Image: ${blog.featured_image || 'NOT SET'}`)
      console.log(`   Excerpt: ${blog.excerpt?.substring(0, 50)}...`)
    })

    console.log('\n✅ Blog data fetching test completed successfully!')
    console.log(`📊 Found ${mappedBlogs.length} published blogs`)
    console.log(`🖼️  Blogs with featured images: ${mappedBlogs.filter(b => b.featured_image).length}`)

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testBlogFetch().catch(console.error) 