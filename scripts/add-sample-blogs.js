const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addSampleBlogs() {
  console.log('Adding sample blog posts...')

  // First, create a sample blog category
  const { data: category, error: categoryError } = await supabase
    .from('blog_categories')
    .insert({
      name: 'Real Estate Insights',
      slug: 'real-estate-insights',
      description: 'Latest insights and trends in real estate'
    })
    .select()
    .single()

  if (categoryError && !categoryError.message.includes('duplicate key')) {
    console.error('Error creating category:', categoryError)
    return
  }

  const categoryId = category?.id || '550e8400-e29b-41d4-a716-446655440000' // fallback UUID

  // Sample blog posts with featured images
  const sampleBlogs = [
    {
      title: 'Top 10 Real Estate Investment Strategies for 2024',
      slug: 'top-10-real-estate-investment-strategies-2024',
      excerpt: 'Discover the most effective real estate investment strategies that are working in 2024. From residential to commercial properties, learn how to maximize your returns.',
      content: {
        blocks: [
          {
            type: 'paragraph',
            content: 'Real estate investment continues to be one of the most reliable ways to build wealth. In 2024, the market presents unique opportunities for savvy investors.'
          }
        ]
      },
      status: 'published',
      category_id: categoryId,
      featured_image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
      seo_title: 'Real Estate Investment Strategies 2024',
      seo_description: 'Learn the top 10 real estate investment strategies for 2024. Expert insights on residential and commercial property investments.',
      published_at: new Date().toISOString()
    },
    {
      title: 'Understanding Property Market Trends in Mumbai',
      slug: 'property-market-trends-mumbai-2024',
      excerpt: 'An in-depth analysis of Mumbai\'s property market trends, including price movements, demand patterns, and future projections.',
      content: {
        blocks: [
          {
            type: 'paragraph',
            content: 'Mumbai\'s real estate market has shown remarkable resilience despite global economic challenges. Understanding these trends is crucial for investors.'
          }
        ]
      },
      status: 'published',
      category_id: categoryId,
      featured_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      seo_title: 'Mumbai Property Market Trends 2024',
      seo_description: 'Comprehensive analysis of Mumbai property market trends, prices, and investment opportunities in 2024.',
      published_at: new Date().toISOString()
    },
    {
      title: 'First-Time Homebuyer Guide: Everything You Need to Know',
      slug: 'first-time-homebuyer-guide',
      excerpt: 'A comprehensive guide for first-time homebuyers covering everything from mortgage options to closing costs and legal requirements.',
      content: {
        blocks: [
          {
            type: 'paragraph',
            content: 'Buying your first home is an exciting milestone, but it can also be overwhelming. This guide will walk you through every step of the process.'
          }
        ]
      },
      status: 'published',
      category_id: categoryId,
      featured_image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
      seo_title: 'First-Time Homebuyer Complete Guide',
      seo_description: 'Complete guide for first-time homebuyers: mortgages, closing costs, legal requirements, and step-by-step process.',
      published_at: new Date().toISOString()
    }
  ]

  for (const blog of sampleBlogs) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .insert(blog)
        .select()

      if (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`Blog "${blog.title}" already exists, skipping...`)
        } else {
          console.error(`Error adding blog "${blog.title}":`, error)
        }
      } else {
        console.log(`✅ Added blog: "${blog.title}"`)
      }
    } catch (err) {
      console.error(`Error processing blog "${blog.title}":`, err)
    }
  }

  console.log('\nSample blog posts added successfully!')
  console.log('You can now test the blog functionality on your website.')
}

addSampleBlogs().catch(console.error) 