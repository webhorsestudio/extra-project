'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function BlogSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((index) => (
        <Card key={index} className="overflow-hidden h-full flex flex-col bg-white border-gray-200">
          <CardHeader className="p-0 relative">
            <div className="relative h-48 w-full">
              <Skeleton className="h-full w-full" />
              {/* Date badge skeleton */}
              <div className="absolute top-3 left-3">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-grow flex flex-col space-y-3">
            {/* Title skeleton */}
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            
            {/* Excerpt skeleton */}
            <div className="space-y-2 flex-grow">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            
            {/* Read more link skeleton */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 