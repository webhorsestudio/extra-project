const { createClient } = require('@supabase/supabase-js')

async function testBlogCategories() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('Testing blog categories functionality...\n')

  try {
    // Test 1: Check if blog_categories table exists and has data
    console.log('1. Checking blog_categories table...')
    const { data: categories, error: categoriesError } = await supabase
      .from('blog_categories')
      .select('*')

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError)
    } else {
      console.log(`✅ Found ${categories.length} categories:`, categories.map(c => c.name))
    }

    // Test 2: Check if blog_category_relations table exists
    console.log('\n2. Checking blog_category_relations table...')
    const { data: relations, error: relationsError } = await supabase
      .from('blog_category_relations')
      .select('*')

    if (relationsError) {
      console.error('❌ Error fetching relations:', relationsError)
    } else {
      console.log(`✅ Found ${relations.length} blog-category relations`)
    }

    // Test 3: Test the blogs_with_categories view
    console.log('\n3. Testing blogs_with_categories view...')
    const { data: blogsWithCategories, error: viewError } = await supabase
      .from('blogs_with_categories')
      .select('*')
      .eq('status', 'published')
      .limit(3)

    if (viewError) {
      console.error('❌ Error fetching blogs with categories:', viewError)
    } else {
      console.log(`✅ Found ${blogsWithCategories.length} blogs with categories`)
      blogsWithCategories.forEach(blog => {
        console.log(`  - ${blog.title} (${blog.categories?.length || 0} categories)`)
      })
    }

    // Test 4: Test single blog fetch
    console.log('\n4. Testing single blog fetch...')
    if (blogsWithCategories.length > 0) {
      const { data: singleBlog, error: singleError } = await supabase
        .from('blogs_with_categories')
        .select('*')
        .eq('id', blogsWithCategories[0].id)
        .single()

      if (singleError) {
        console.error('❌ Error fetching single blog:', singleError)
      } else {
        console.log(`✅ Single blog fetched: ${singleBlog.title}`)
        console.log(`   Categories: ${singleBlog.categories?.length || 0}`)
      }
    }

    console.log('\n✅ Blog categories test completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testBlogCategories() 