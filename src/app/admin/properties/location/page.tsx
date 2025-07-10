'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Edit,
  List
} from 'lucide-react'
import { AddLocationForm } from '@/components/admin/properties/locations/AddLocationForm'
import { LocationList } from '@/components/admin/properties/locations/LocationList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Skeleton } from '@/components/ui/skeleton'

interface Location {
  id: string
  name: string
  description: string | null
  image_url: string | null
  image_storage_path: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function LocationPage() {
  const { user, profile, loading, error } = useAdminAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [activeTab, setActiveTab] = useState('list')

  const handleLocationAdded = () => {
    // Trigger refresh of the location list
    setRefreshTrigger(prev => prev + 1)
    // Switch back to list tab
    setActiveTab('list')
    // Clear editing state
    setEditingLocation(null)
  }

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location)
    setActiveTab('add')
  }

  const handleCancelEdit = () => {
    setEditingLocation(null)
    setActiveTab('list')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !user || !profile) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Location Management</h1>
            <p className="text-muted-foreground">
              Manage property locations and areas
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {error || 'Unable to load location management'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Location Management</h1>
          <p className="text-muted-foreground">
            Manage property locations and areas
          </p>
        </div>
        {editingLocation && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Edit className="h-4 w-4" />
            Editing: {editingLocation.name}
          </div>
        )}
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            All Locations
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            {editingLocation ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingLocation ? 'Edit Location' : 'Add Location'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <LocationList 
            refreshTrigger={refreshTrigger} 
            onEditLocation={handleEditLocation}
            isAuthenticated={!!user && !!profile}
          />
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <AddLocationForm 
            onLocationAdded={handleLocationAdded}
            editingLocation={editingLocation}
            onCancelEdit={handleCancelEdit}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 
