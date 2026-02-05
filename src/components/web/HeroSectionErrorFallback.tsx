'use client'

interface HeroSectionErrorFallbackProps {
  error: Error
  resetError: () => void
}

export default function HeroSectionErrorFallback({ resetError }: HeroSectionErrorFallbackProps) {
  return (
    <div className="relative bg-white w-screen flex flex-col justify-center items-center p-0 m-0 overflow-hidden py-12">
      <div className="w-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-center text-gray-900 mb-2">
            The Ultimate Address for your Luxury Homes
          </h1>
          <p className="text-base sm:text-lg text-center text-gray-700 mb-6">
            Discover the best homes for you & your family
          </p>
          <div className="text-sm text-red-600 mb-4">
            Unable to load dynamic content
          </div>
          <button
            onClick={resetError}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
} 