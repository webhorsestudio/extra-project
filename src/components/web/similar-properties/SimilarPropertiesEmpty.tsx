import React from 'react';
import { Building2 } from 'lucide-react';

export default function SimilarPropertiesEmpty() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="text-center text-gray-600">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg">No similar properties found</p>
        <p className="text-sm text-gray-500 mt-2">
          Check back later for more properties in this area
        </p>
      </div>
    </div>
  );
} 