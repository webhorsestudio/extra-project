import React from 'react';
import { Building2 } from 'lucide-react';

interface SimilarPropertiesErrorProps {
  error?: string;
  onRetry?: () => void;
}

export default function SimilarPropertiesError({ 
  error = "Unable to load similar properties",
  onRetry 
}: SimilarPropertiesErrorProps) {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="text-center text-gray-600">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg mb-2">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
} 