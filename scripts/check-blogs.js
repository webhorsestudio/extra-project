const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkBlogs() {
  console.log('Checking blog data...')

  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('id, title, excerpt, featured_image, created_at, status')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching blogs:', error)
    return
  }

  console.log(`Found ${blogs.length} blogs:`)
  
  blogs.forEach((blog, index) => {
    console.log(`\n${index + 1}. ${blog.title}`)
    console.log(`   Status: ${blog.status}`)
    console.log(`   Featured Image: ${blog.featured_image || 'NOT SET'}`)
    console.log(`   Created: ${blog.created_at}`)
  })

  // Check if any blogs have featured images
  const blogsWithImages = blogs.filter(blog => blog.featured_image)
  console.log(`\n📊 Summary:`)
  console.log(`   Total blogs: ${blogs.length}`)
  console.log(`   Blogs with featured images: ${blogsWithImages.length}`)
  console.log(`   Published blogs: ${blogs.filter(b => b.status === 'published').length}`)
}

checkBlogs().catch(console.error) 