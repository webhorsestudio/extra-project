'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Dumbbell, 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Image as ImageIcon
} from 'lucide-react'
import { AddAmenityForm } from '@/components/admin/properties/AddAmenityForm'
import { EditAmenityForm } from '@/components/admin/properties/EditAmenityForm'
import { Amenity } from '@/types/amenity'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface AmenitiesClientProps {
  amenities: Amenity[]
}

export default function AmenitiesClient({ amenities: initialAmenities }: AmenitiesClientProps) {
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities)
  const [filteredAmenities, setFilteredAmenities] = useState<Amenity[]>(initialAmenities)
  const [searchTerm, setSearchTerm] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setAmenities(initialAmenities)
  }, [initialAmenities])

  useEffect(() => {
    filterAmenities()
  }, [amenities, searchTerm])

  const filterAmenities = () => {
    if (!searchTerm.trim()) {
      setFilteredAmenities(amenities)
      return
    }

    const filtered = amenities.filter(amenity =>
      amenity.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredAmenities(filtered)
  }

  const handleAmenityAdded = () => {
    fetchAmenities()
  }

  const handleAmenityUpdated = () => {
    fetchAmenities()
    setEditOpen(false)
    setSelectedAmenity(null)
  }

  const handleEdit = (amenity: Amenity) => {
    setSelectedAmenity(amenity)
    setEditOpen(true)
  }

  const handleDelete = async (amenityId: string) => {
    try {
      setDeletingId(amenityId)
      const res = await fetch(`/api/amenities/${amenityId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Amenity deleted successfully')
        fetchAmenities()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete amenity')
      }
    } catch (error) {
      toast.error('Error deleting amenity')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleAmenityStatus = async (amenity: Amenity) => {
    try {
      const res = await fetch(`/api/amenities/${amenity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: amenity.name,
          image_url: amenity.image_url,
          image_storage_path: amenity.image_storage_path,
          is_active: !amenity.is_active
        })
      })

      if (res.ok) {
        toast.success(`Amenity ${amenity.is_active ? 'deactivated' : 'activated'} successfully`)
        fetchAmenities()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update amenity')
      }
    } catch (error) {
      toast.error('Error updating amenity')
    }
  }

  const fetchAmenities = async () => {
    try {
      const res = await fetch('/api/amenities')
      if (res.ok) {
        const data = await res.json()
        setAmenities(data.amenities || [])
      } else {
        toast.error('Failed to fetch amenities')
      }
    } catch (error) {
      toast.error('Error fetching amenities')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Amenities Management</h1>
          <p className="text-muted-foreground">
            Manage property amenities and facilities
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Amenity
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search amenities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Forms */}
      <AddAmenityForm open={addOpen} onOpenChange={setAddOpen} onAmenityAdded={handleAmenityAdded} />
      {selectedAmenity && (
        <EditAmenityForm 
          open={editOpen} 
          onOpenChange={setEditOpen} 
          onAmenityUpdated={handleAmenityUpdated}
          amenity={selectedAmenity}
        />
      )}

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Property Amenities
            <Badge variant="secondary">{filteredAmenities.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAmenities.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No amenities found' : 'No amenities yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Start by adding your first property amenity'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Amenity
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAmenities.map((amenity) => (
                <Card key={amenity.id} className="overflow-hidden group hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    {amenity.image_url ? (
                      <Image src={amenity.image_url} alt={amenity.name} width={48} height={48} className="rounded border" />
                    ) : (
                      <div className="flex items-center justify-center w-12 h-12 bg-muted rounded">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg truncate">{amenity.name}</h3>
                        <Badge variant={amenity.is_active ? "default" : "secondary"} className="text-xs">
                          {amenity.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Added {amenity.created_at ? new Date(amenity.created_at).toLocaleDateString() : ''}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(amenity)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleAmenityStatus(amenity)}>
                          <Badge variant={amenity.is_active ? "secondary" : "default"} className="mr-2 text-xs">
                            {amenity.is_active ? 'Deactivate' : 'Activate'}
                          </Badge>
                          {amenity.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(amenity.id)}
                          disabled={deletingId === amenity.id}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === amenity.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 