'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Property, Amenity, PropertyCategory } from '@/types/property'
import { CheckCircle, Plus, Tag } from 'lucide-react'

interface PropertyRelationshipsProps {
  property: Property
  allAmenities?: Amenity[]
  allCategories?: PropertyCategory[]
  onUpdateAmenities?: (amenityIds: string[]) => void
  onUpdateCategories?: (categoryIds: string[]) => void
}

export function PropertyRelationships({ 
  property, 
  allAmenities = [], 
  allCategories = [],
  onUpdateAmenities,
  onUpdateCategories 
}: PropertyRelationshipsProps) {
  const currentAmenityIds = property.property_amenities?.map(rel => rel.amenity_id) || []
  const currentCategoryIds = property.property_categories?.map(rel => rel.category_id) || []

  const handleAmenityToggle = (amenityId: string) => {
    if (!onUpdateAmenities) return
    
    const newAmenityIds = currentAmenityIds.includes(amenityId)
      ? currentAmenityIds.filter(id => id !== amenityId)
      : [...currentAmenityIds, amenityId]
    
    onUpdateAmenities(newAmenityIds)
  }

  const handleCategoryToggle = (categoryId: string) => {
    if (!onUpdateCategories) return
    
    const newCategoryIds = currentCategoryIds.includes(categoryId)
      ? currentCategoryIds.filter(id => id !== categoryId)
      : [...currentCategoryIds, categoryId]
    
    onUpdateCategories(newCategoryIds)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Property Relationships</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Amenities ({currentAmenityIds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allAmenities.length > 0 ? (
              <div className="space-y-3">
                {allAmenities.map((amenity) => {
                  const isSelected = currentAmenityIds.includes(amenity.id)
                  return (
                    <div
                      key={amenity.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleAmenityToggle(amenity.id)}
                    >
                      <div className="flex items-center gap-3">
                        {amenity.image_url && (
                          <img
                            src={amenity.image_url}
                            alt={amenity.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{amenity.name}</p>
                          <Badge 
                            variant={amenity.is_active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {amenity.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Plus className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No amenities available</p>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categories ({currentCategoryIds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allCategories.length > 0 ? (
              <div className="space-y-3">
                {allCategories.map((category) => {
                  const isSelected = currentCategoryIds.includes(category.id)
                  return (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleCategoryToggle(category.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                          <span className="text-lg">{category.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <Badge 
                            variant={category.is_active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {category.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Plus className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No categories available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Relationships Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Relationships Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Selected Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {property.property_amenities?.map((relation) => (
                  <Badge key={relation.id} variant="outline">
                    {relation.amenity?.name || 'Unknown Amenity'}
                  </Badge>
                )) || <span className="text-muted-foreground text-sm">No amenities selected</span>}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Selected Categories</h4>
              <div className="flex flex-wrap gap-2">
                {property.property_categories?.map((relation) => (
                  <Badge key={relation.id} variant="outline">
                    {relation.category?.name || 'Unknown Category'}
                  </Badge>
                )) || <span className="text-muted-foreground text-sm">No categories selected</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 