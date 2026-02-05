const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBlogContent() {
  try {
    console.log('🔍 Checking blog content structure...');
    
    const { data: blogs, error } = await supabase
      .from('blogs_with_categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error fetching blogs:', error);
      return;
    }
    
    if (blogs && blogs.length > 0) {
      const blog = blogs[0];
      console.log('\n📝 Blog data structure:');
      console.log('ID:', blog.id);
      console.log('Title:', blog.title);
      console.log('Content type:', typeof blog.content);
      console.log('Content:', JSON.stringify(blog.content, null, 2));
      
      // Check if content has blocks property
      if (blog.content && typeof blog.content === 'object') {
        console.log('\n🔍 Content analysis:');
        console.log('Has blocks:', !!blog.content.blocks);
        console.log('Blocks type:', typeof blog.content.blocks);
        console.log('Blocks length:', blog.content.blocks ? blog.content.blocks.length : 'N/A');
        
        if (blog.content.blocks && Array.isArray(blog.content.blocks)) {
          console.log('\n📋 First block:');
          console.log(JSON.stringify(blog.content.blocks[0], null, 2));
        }
      }
    } else {
      console.log('❌ No blogs found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBlogContent(); 