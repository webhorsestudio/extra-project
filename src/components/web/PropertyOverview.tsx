import { Badge } from "@/components/ui/badge"
import { Property } from "@/types/property"
import { MapPin } from "lucide-react"

interface PropertyOverviewProps {
  property: Pick<Property, 'title' | 'location' | 'property_type' | 'property_configurations' | 'description' | 'amenities'>
}

export default function PropertyOverview({ property }: PropertyOverviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">{property.title}</h1>
        <div className="flex items-center text-gray-500 mt-2">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{property.location}</span>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Badge>{property.property_type}</Badge>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">About this property</h2>
        <p className="text-gray-600 whitespace-pre-wrap">{property.description}</p>
      </div>

      {property.amenities && property.amenities.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((amenity) => (
              <Badge key={amenity.name} variant="secondary">{amenity.name}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 