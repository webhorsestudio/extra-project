import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BlogCategory {
  id: string;
  name: string;
}

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    excerpt: string;
    featured_image: string | null;
    created_at?: string;
    categories?: BlogCategory[];
  };
}

export default function BlogCard({ blog }: BlogCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link href={`/m/blogs/${blog.id}`} className="block group focus:outline-none">
      <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300 flex flex-col h-full">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={imageError || !blog.featured_image ? '/placeholder.svg' : blog.featured_image}
            alt={`Featured image for ${blog.title}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 600px) 100vw, 50vw"
            onError={handleImageError}
            priority={false}
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Date badge */}
          {blog.created_at && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-700 text-xs font-medium rounded-lg px-3 py-1 flex items-center gap-1 shadow-lg">
              <Calendar className="h-3 w-3" />
              {formatDate(blog.created_at)}
            </div>
          )}

          {/* Category badges */}
          {blog.categories && blog.categories.length > 0 && (
            <div className="absolute top-3 right-3 flex flex-wrap gap-1">
              {blog.categories.slice(0, 2).map((cat: BlogCategory, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-md text-gray-700 text-xs font-medium shadow-lg"
                >
                  {cat.name}
                </Badge>
              ))}
              {blog.categories.length > 2 && (
                <Badge
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-md text-gray-700 text-xs font-medium shadow-lg"
                >
                  +{blog.categories.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
            {blog.title}
          </h3>
          
          {/* Excerpt */}
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-3 flex-grow">
            {blog.excerpt}
          </p>
          
          {/* Read more link */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <span className="text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-200">
              Read More
            </span>
            <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </Link>
  );
} 