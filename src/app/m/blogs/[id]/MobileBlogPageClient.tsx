'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Share2, Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlogCard from '@/components/mobile/BlogCard';
import { shareProperty, copyToClipboard } from '@/lib/utils/share';
import Image from 'next/image';

interface BlogCategory {
  id: string;
  name: string;
}

// Raw blog data from database (matches Supabase schema)
interface RawBlog {
  id: string;
  title: string;
  excerpt: string;
  created_at: string;
  featured_image: string | null;
  categories?: BlogCategory[];
}

// Normalized blog data for BlogCard component
interface NormalizedBlog {
  id: string;
  title: string;
  excerpt: string;
  created_at: string;
  featured_image: string | null;
  categories?: BlogCategory[];
}

interface MobileBlogPageClientProps {
  blog: RawBlog;
  relatedBlogs: RawBlog[];
  content: string;
}

export default function MobileBlogPageClient({ 
  blog, 
  relatedBlogs, 
  content 
}: MobileBlogPageClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Normalize related blogs data
  const normalizedRelatedBlogs: NormalizedBlog[] = relatedBlogs.map(relatedBlog => ({
    ...relatedBlog,
    featured_image: relatedBlog.featured_image ?? null,
  }));

  const handleBack = () => {
    router.push('/m/blogs');
  };

  const handleShare = async () => {
    const shareData = {
      title: blog.title,
      text: blog.excerpt || `Check out this blog post: ${blog.title}`,
      url: window.location.href,
    };
    await shareProperty(shareData);
  };

  const handleCopyLink = async () => {
    await copyToClipboard(window.location.href, "Blog link copied!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      color: 'hover:text-blue-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`,
      color: 'hover:text-blue-500'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      color: 'hover:text-blue-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blog Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Blog</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Featured Image */}
        {blog.featured_image && (
          <div className="relative w-full h-64 overflow-hidden">
            <Image
              src={blog.featured_image}
              alt={blog.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        )}

        {/* Blog Info Card */}
        <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-lg mx-2 p-6">
          <div className="space-y-4">
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(blog.created_at)}
              </span>
              {blog.categories && blog.categories.length > 0 && (
                <span className="text-blue-600 font-medium">
                  {blog.categories.map((cat: BlogCategory) => cat.name).join(', ')}
                </span>
              )}
            </div>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-gray-600 leading-relaxed">
                {blog.excerpt}
              </p>
            )}
          </div>
        </div>

        {/* Blog Content */}
        <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-lg mx-2 p-6">
          <div className="prose prose-sm max-w-none text-gray-900">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-lg mx-2 p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Share this post</h3>
            
            <div className="flex items-center gap-4">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-500 transition-colors ${link.color}`}
                  aria-label={`Share on ${link.name}`}
                >
                  <link.icon className="h-6 w-6" />
                </a>
              ))}
              
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1 text-gray-500 transition-colors hover:text-gray-700 ${
                  copied ? 'text-green-600' : ''
                }`}
                aria-label="Copy link"
              >
                <Copy className="h-6 w-6" />
                {copied && <span className="text-sm">Copied!</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {normalizedRelatedBlogs.length > 0 && (
          <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-lg mx-2 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Posts</h3>
            <div className="space-y-4">
              {normalizedRelatedBlogs.map((relatedBlog: NormalizedBlog) => (
                <BlogCard key={relatedBlog.id} blog={relatedBlog} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 