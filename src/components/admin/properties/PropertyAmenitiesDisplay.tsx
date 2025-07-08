'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Wifi, Car, Waves, Dumbbell as GymIcon, Trees, Shield, ArrowUpDown, Flower2, Car as ParkingIcon } from 'lucide-react';

interface PropertyAmenitiesDisplayProps {
  amenities: string[];
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

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return Wifi;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('garage')) return ParkingIcon;
    if (lowerAmenity.includes('pool') || lowerAmenity.includes('swimming')) return Waves;
    if (lowerAmenity.includes('gym') || lowerAmenity.includes('fitness')) return GymIcon;
    if (lowerAmenity.includes('garden') || lowerAmenity.includes('lawn')) return Flower2;
    if (lowerAmenity.includes('security') || lowerAmenity.includes('guard')) return Shield;
    if (lowerAmenity.includes('elevator') || lowerAmenity.includes('lift')) return ArrowUpDown;
    if (lowerAmenity.includes('park') || lowerAmenity.includes('playground')) return Trees;
    if (lowerAmenity.includes('car') || lowerAmenity.includes('vehicle')) return Car;
    return Dumbbell;
  };

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
          {amenities.map((amenity, index) => {
            const IconComponent = getAmenityIcon(amenity);
            return (
              <div key={index} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                <IconComponent className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{amenity}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 