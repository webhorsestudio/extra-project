import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  MapPin,
  Calendar,
  CheckCircle,
  Building2,
  Heart
} from 'lucide-react'
import { formatIndianPrice, formatIndianNumber } from '@/lib/utils'
import Link from 'next/link'

interface Property {
  id: string
  title: string
  price: number
  property_type: string
  location: string
  thumbnail_url?: string
  bhk: number
  area: number
  bedrooms: number
  bathrooms: number
  created_at?: string
  status?: string
  rera_number?: string
  view_count?: number
  favorite_count?: number
  review_count?: number
  is_verified?: boolean
  property_collection?: string
}

interface PropertyCardProps {
  property: Property
  viewMode: 'grid' | 'list'
  isSelected: boolean
  onToggleSelection: (propertyId: string) => void
  onDelete: (propertyId: string) => void
  getPropertyTypeColor: (type: string) => string
  getCollectionColor: (collection: string) => string
  formatDate: (dateString: string) => string
}

export default function PropertyCard({
  property,
  viewMode,
  isSelected,
  onToggleSelection,
  onDelete,
  getPropertyTypeColor,
  getCollectionColor,
  formatDate
}: PropertyCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(property.id)}
              className="rounded border-gray-300"
            />

            {/* Image */}
            <div className="relative h-16 w-24 rounded-lg overflow-hidden flex-shrink-0">
              {property.thumbnail_url ? (
                <img
                  src={property.thumbnail_url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{property.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{property.location}</span>
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-primary">
                    {formatIndianPrice(property.price)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {property.bhk} BHK • {formatIndianNumber(property.area)} sq ft
                  </div>
                </div>
              </div>

              {/* Badges and Stats */}
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getPropertyTypeColor(property.property_type)}>
                  {property.property_type}
                </Badge>
                {property.property_collection && (
                  <Badge className={getCollectionColor(property.property_collection)}>
                    {property.property_collection}
                  </Badge>
                )}
                {property.is_verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {property.status && (
                  <Badge variant="outline" className="text-xs">
                    {property.status}
                  </Badge>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{property.created_at ? formatDate(property.created_at) : 'N/A'}</span>
                </div>
                {property.view_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{property.view_count}</span>
                  </div>
                )}
                {property.favorite_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{property.favorite_count}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/web/properties/${property.id}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/properties/${property.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(property.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid View
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {property.thumbnail_url ? (
            <img
              src={property.thumbnail_url}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200">
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelection(property.id)}
                className="rounded border-gray-300 bg-white/90"
              />
            </div>
            <div className="absolute top-3 right-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="bg-white/90 hover:bg-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/web/properties/${property.id}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/properties/${property.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(property.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Badges overlay */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            <Badge className={getPropertyTypeColor(property.property_type)}>
              {property.property_type}
            </Badge>
            {property.is_verified && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Title and Location */}
          <div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
            <p className="text-sm text-muted-foreground flex items-center">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{property.location}</span>
            </p>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-primary">
            {formatIndianPrice(property.price)}
          </div>

          {/* Property Details */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{property.created_at ? formatDate(property.created_at) : 'N/A'}</span>
            </div>
            {property.view_count !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{property.view_count}</span>
              </div>
            )}
            {property.favorite_count !== undefined && (
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{property.favorite_count}</span>
              </div>
            )}
          </div>

          {/* Collection and Status */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {property.property_collection && (
                <Badge className={getCollectionColor(property.property_collection)}>
                  {property.property_collection}
                </Badge>
              )}
              {property.status && (
                <Badge variant="outline" className="text-xs">
                  {property.status}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {property.created_at ? formatDate(property.created_at) : 'N/A'}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {property.view_count !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{property.view_count}</span>
                </div>
              )}
              {property.favorite_count !== undefined && (
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{property.favorite_count}</span>
                </div>
              )}
            </div>
            {property.rera_number && (
              <div className="text-xs text-muted-foreground">
                RERA: {property.rera_number}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 