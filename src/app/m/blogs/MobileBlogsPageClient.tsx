'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import BlogCard from '@/components/mobile/BlogCard';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface Category {
  name: string;
}

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  created_at: string;
  featured_image?: string;
  categories?: Category[];
}

interface MobileBlogsPageClientProps {
  blogs: Blog[];
}

// For normalization: categories may come from DB as { id?: string; name: string }
type BlogCategoryRaw = { id?: string; name: string };

export default function MobileBlogsPageClient({ blogs }: MobileBlogsPageClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique categories from blogs
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    blogs.forEach(blog => {
      if (blog.categories && Array.isArray(blog.categories)) {
        blog.categories.forEach((cat: Category) => {
          if (cat.name) categorySet.add(cat.name);
        });
      }
    });
    return Array.from(categorySet);
  }, [blogs]);

  // Filter blogs based on search and category
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesSearch = searchQuery === '' || 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        (blog.categories && blog.categories.some((cat: Category) => cat.name === selectedCategory));
      
      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchQuery, selectedCategory]);

  // Normalize filteredBlogs for BlogCard
  const normalizedFilteredBlogs = useMemo(() =>
    filteredBlogs.map(blog => ({
      ...blog,
      featured_image: blog.featured_image ?? null,
      categories: blog.categories?.map((cat: BlogCategoryRaw) => ({
        id: cat.id ?? cat.name,
        name: cat.name,
      })) ?? [],
    })),
    [filteredBlogs]
  );

  const handleBack = () => {
    router.push('/m');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Blogs</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === 'all' ? 'default' : 'secondary'}
                className={`cursor-pointer ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedCategory('all')}
              >
                All ({blogs.length})
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'secondary'}
                  className={`cursor-pointer ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Blogs Available</h2>
              <p className="text-gray-600">Check back later for new blog posts.</p>
            </div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>{filteredBlogs.length} of {blogs.length} blogs</span>
              {searchQuery && (
                <span>Searching for &quot;{searchQuery}&quot;</span>
              )}
            </div>

            {/* Blog Cards */}
            {normalizedFilteredBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 