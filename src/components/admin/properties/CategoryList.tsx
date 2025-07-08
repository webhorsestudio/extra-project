import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit, Trash2, Calendar, Search, Filter, Plus, Grid3X3, List, Eye, EyeOff, AlertCircle } from 'lucide-react'
import CategoryForm from './CategoryForm'
import * as LucideIcons from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'

interface CategoryListProps {
  onChange?: () => void
  categories?: any[]
}

export default function CategoryList({ onChange, categories: categoriesProp }: CategoryListProps) {
  // If categories are provided as a prop (SSR), use them; otherwise, use the hook
  const hook = useCategories({ includeInactive: true })
  const categories = categoriesProp || hook.categories
  const loading = categoriesProp ? false : hook.loading
  const error = categoriesProp ? undefined : hook.error
  const refetch = categoriesProp ? () => {} : hook.refetch
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [editDialog, setEditDialog] = useState<string | null>(null)

  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showAddForm, setShowAddForm] = useState(false)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    setDeleting(null)
    setDeleteDialog(null)
    if (res.ok) {
      refetch() // Refresh categories after deletion
      if (onChange) onChange()
    }
  }

  // Filter and search logic
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && cat.is_active) || 
        (statusFilter === 'inactive' && !cat.is_active)
      return matchesSearch && matchesStatus
    })
  }, [categories, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const total = categories.length
    const active = categories.filter(cat => cat.is_active).length
    const inactive = total - active
    return { total, active, inactive }
  }, [categories])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-20" />
        </div>
        
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
            </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
              </CardContent>
          </Card>
        ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="text-center py-12">
          <div className="text-destructive mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
          <Button onClick={refetch} variant="outline">
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Property Categories</h2>
            <p className="text-muted-foreground">
              Manage your property categories and classifications
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCategories.length} of {categories.length} categories
          </p>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear search
            </Button>
          )}
        </div>

        {/* Categories Grid/List */}
        {filteredCategories.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No categories found</p>
                <p className="text-sm">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Get started by creating your first category'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-3"
          }>
            {filteredCategories.map(cat => {
          let LucideIcon: any = null;
          if (typeof cat.icon === 'string' && cat.icon in LucideIcons) {
            LucideIcon = (LucideIcons as any)[cat.icon];
          }
              
              return viewMode === 'grid' ? (
                <Card key={cat.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
                  <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                        {LucideIcon ? (
                          <LucideIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        ) : (
                          <div className="h-6 w-6 bg-muted-foreground/20 rounded" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{cat.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Added {cat.created_at ? new Date(cat.created_at).toLocaleDateString() : ''}</span>
                        </div>
                      </div>
                      <Badge 
                        variant={cat.is_active ? 'default' : 'secondary'} 
                        className="shrink-0"
                      >
                  {cat.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            onClick={() => setEditDialog(cat.id)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Category</TooltipContent>
                      </Tooltip>
                      {editDialog === cat.id && (
                        <CategoryForm
                          mode="edit"
                          initialData={{ ...cat, icon: typeof cat.icon === 'string' ? cat.icon : '' }}
                          onSuccess={() => {
                            setEditDialog(null)
                            refetch()
                            if (onChange) onChange()
                          }}
                          trigger={<span />}
                          open={true}
                          onOpenChange={open => setEditDialog(open ? cat.id : null)}
                        />
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialog open={deleteDialog === cat.id} onOpenChange={open => setDeleteDialog(open ? cat.id : null)}>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                disabled={deleting === cat.id}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                {deleting === cat.id ? (
                                  <span className="animate-spin h-4 w-4 border-b-2 border-current rounded-full" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{cat.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(cat.id)} 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipTrigger>
                        <TooltipContent>Delete Category</TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card key={cat.id} className="group hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                        {LucideIcon ? (
                          <LucideIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        ) : (
                          <div className="h-5 w-5 bg-muted-foreground/20 rounded" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base">{cat.name}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Added {cat.created_at ? new Date(cat.created_at).toLocaleDateString() : ''}</span>
                        </div>
              </div>
                      <Badge 
                        variant={cat.is_active ? 'default' : 'secondary'} 
                        className="shrink-0"
                      >
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="outline" 
                              onClick={() => setEditDialog(cat.id)}
                            >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                          <TooltipContent>Edit Category</TooltipContent>
                </Tooltip>
                {editDialog === cat.id && (
                  <CategoryForm
                    mode="edit"
                    initialData={{ ...cat, icon: typeof cat.icon === 'string' ? cat.icon : '' }}
                    onSuccess={() => {
                      setEditDialog(null)
                              refetch()
                      if (onChange) onChange()
                    }}
                    trigger={<span />}
                    open={true}
                    onOpenChange={open => setEditDialog(open ? cat.id : null)}
                  />
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialog open={deleteDialog === cat.id} onOpenChange={open => setDeleteDialog(open ? cat.id : null)}>
                      <AlertDialogTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  disabled={deleting === cat.id}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  {deleting === cat.id ? (
                                    <span className="animate-spin h-4 w-4 border-b-2 border-current rounded-full" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{cat.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(cat.id)} 
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TooltipTrigger>
                          <TooltipContent>Delete Category</TooltipContent>
                </Tooltip>
              </div>
                    </div>
                  </CardContent>
            </Card>
          )
        })}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
} 