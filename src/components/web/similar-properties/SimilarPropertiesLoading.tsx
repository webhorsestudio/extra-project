import React from 'react';
import { Loader2 } from 'lucide-react';

export default function SimilarPropertiesLoading() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="flex items-center gap-3 text-gray-600">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-lg">Finding similar properties...</span>
      </div>
    </div>
  );
} 