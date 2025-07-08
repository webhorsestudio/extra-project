import React from 'react';

interface SimilarPropertiesHeaderProps {
  title?: string;
  subtitle?: string;
  showPersonalization?: boolean;
  personalizedCount?: number;
}

export default function SimilarPropertiesHeader({
  title = "Similar Projects",
  subtitle = "Discover more properties like this one",
  showPersonalization = false,
  personalizedCount = 0
}: SimilarPropertiesHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-[#0A1736] mb-2">
        {title}
      </h2>
      <p className="text-gray-600 text-base md:text-lg">
        {subtitle}
      </p>
      {showPersonalization && personalizedCount > 0 && (
        <div className="mt-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            {personalizedCount} personalized recommendations
          </span>
        </div>
      )}
    </div>
  );
} 