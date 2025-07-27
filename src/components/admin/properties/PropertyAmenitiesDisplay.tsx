'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Amenity {
  name: string;
  image_url?: string;
}

interface PropertyAmenitiesDisplayProps {
  amenities: Amenity[];
}

export default function PropertyAmenitiesDisplay({ amenities }: PropertyAmenitiesDisplayProps) {
  if (!amenities || amenities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Amenities & Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No amenities listed for this property.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Amenities & Features
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {amenities.length} amenit{amenities.length === 1 ? 'y' : 'ies'} available
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
              {amenity.image_url ? (
                <Image 
                  src={amenity.image_url} 
                  alt={amenity.name} 
                  width={24} 
                  height={24} 
                  className="rounded object-cover"
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{amenity.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 