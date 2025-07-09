'use client';

import { useEffect, useState } from 'react';

export default function BlogContent({ content }: { content: string }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle SSR - don't render content on server to avoid hydration issues
  if (!isClient) {
    return (
      <div className="prose prose-lg max-w-none text-gray-900 mt-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="prose prose-lg max-w-none text-gray-900 mt-6">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
} 