'use client'

interface CategoryBarErrorFallbackProps {
  error: Error
  resetError: () => void
}

export default function CategoryBarErrorFallback({ resetError }: CategoryBarErrorFallbackProps) {
  return (
    <div className="bg-gray-50 border-b border-gray-200 py-4">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-center text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>Unable to load categories</span>
            <button
              onClick={resetError}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 