'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Building, 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Image as ImageIcon,
  Globe,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { AddDeveloperForm } from '@/components/admin/properties/AddDeveloperForm'
import { EditDeveloperForm } from '@/components/admin/properties/EditDeveloperForm'
import { PropertyDeveloper } from '@/types/property'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface DevelopersClientProps {
  developers: PropertyDeveloper[]
}

export default function DevelopersClient({ developers: initialDevelopers }: DevelopersClientProps) {
  const [developers, setDevelopers] = useState<PropertyDeveloper[]>(initialDevelopers)
  const [filteredDevelopers, setFilteredDevelopers] = useState<PropertyDeveloper[]>(initialDevelopers)
  const [searchTerm, setSearchTerm] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedDeveloper, setSelectedDeveloper] = useState<PropertyDeveloper | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setDevelopers(initialDevelopers)
  }, [initialDevelopers])

  const filterDevelopers = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredDevelopers(developers)
      return
    }

    const filtered = developers.filter(developer =>
      developer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      developer.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      developer.address?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredDevelopers(filtered)
  }, [developers, searchTerm])

  useEffect(() => {
    filterDevelopers()
  }, [filterDevelopers])

  const handleDeveloperAdded = () => {
    fetchDevelopers()
  }

  const handleDeveloperUpdated = () => {
    fetchDevelopers()
    setEditOpen(false)
    setSelectedDeveloper(null)
  }

  const fetchDevelopers = async () => {
    try {
      const res = await fetch('/api/developers')
      if (res.ok) {
        const data = await res.json()
        setDevelopers(data.developers || [])
      } else {
        toast.error('Failed to fetch sellers')
      }
    } catch {
              toast.error('Error fetching sellers')
    }
  }

  const handleEdit = (developer: PropertyDeveloper) => {
    setSelectedDeveloper(developer)
    setEditOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this seller?')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/developers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Seller deleted successfully')
        fetchDevelopers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete seller')
      }
    } catch {
      toast.error('Error deleting seller')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleDeveloperStatus = async (developer: PropertyDeveloper) => {
    try {
      const res = await fetch(`/api/developers/${developer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...developer, is_active: !developer.is_active })
      })
      
      if (res.ok) {
        toast.success(`Seller ${developer.is_active ? 'deactivated' : 'activated'} successfully`)
        fetchDevelopers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update seller status')
      }
    } catch {
      toast.error('Error updating seller status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sellers Management</h1>
          <p className="text-muted-foreground">
            Manage property sellers and brokers
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Seller
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sellers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Forms */}
      <AddDeveloperForm open={addOpen} onOpenChange={setAddOpen} onDeveloperAdded={handleDeveloperAdded} />
      {selectedDeveloper && (
        <EditDeveloperForm 
          open={editOpen} 
          onOpenChange={setEditOpen} 
          onDeveloperUpdated={handleDeveloperUpdated}
          developer={selectedDeveloper}
        />
      )}

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Property Sellers
            <Badge variant="secondary">{filteredDevelopers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDevelopers.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No sellers found' : 'No sellers yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Start by adding your first property seller'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Seller
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDevelopers.map((developer) => (
                <Card key={developer.id} className="overflow-hidden group hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    {developer.logo_url ? (
                      <Image src={developer.logo_url} alt={developer.name} width={48} height={48} className="rounded border object-contain" />
                    ) : (
                      <div className="flex items-center justify-center w-12 h-12 bg-muted rounded">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg truncate">{developer.name}</h3>
                        <Badge variant={developer.is_active ? "default" : "secondary"} className="text-xs">
                          {developer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Added {developer.created_at ? new Date(developer.created_at).toLocaleDateString() : ''}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(developer)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleDeveloperStatus(developer)}>
                          <Badge variant={developer.is_active ? "secondary" : "default"} className="mr-2 text-xs">
                            {developer.is_active ? 'Deactivate' : 'Activate'}
                          </Badge>
                          {developer.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(developer.id)}
                          disabled={deletingId === developer.id}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === developer.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      {developer.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <a href={developer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                            {developer.website}
                          </a>
                        </div>
                      )}
                      {developer.address && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{developer.address}</span>
                        </div>
                      )}
                      {developer.contact_info?.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{developer.contact_info.phone}</span>
                        </div>
                      )}
                      {developer.contact_info?.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{developer.contact_info.email}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 