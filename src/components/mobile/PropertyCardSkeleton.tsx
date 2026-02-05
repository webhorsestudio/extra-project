export default function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-2xl" />
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="mt-3">
          <div className="flex items-center justify-between mt-1 mb-1">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="h-4 bg-gray-200 rounded w-14" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
} 