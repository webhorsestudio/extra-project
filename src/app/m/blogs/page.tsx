import { createSupabaseServerClient } from '@/lib/supabase/server';
import MobileBlogsPageClient from './MobileBlogsPageClient';

export default async function MobileBlogsPage() {
  const supabase = await createSupabaseServerClient();
  
  // Fetch all published blogs
  const { data: blogs, error } = await supabase
    .from('blogs_with_categories')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Blogs fetch error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Blogs</h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <MobileBlogsPageClient blogs={blogs || []} />
  );
} 