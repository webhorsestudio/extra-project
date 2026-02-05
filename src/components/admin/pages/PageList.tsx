'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  FileText, 
  Calendar,
  Eye,
  RefreshCw
} from 'lucide-react'
import { DeletePageDialog } from './DeletePageDialog'
import { useRouter } from 'next/navigation'

interface Page {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

interface PageListProps {
  initialPages?: Page[]
}

export default function PageList({ initialPages = [] }: PageListProps) {
  const [pages, setPages] = useState<Page[]>(initialPages)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async (page: Page) => {
    setPageToDelete(page)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!pageToDelete) return

    try {
      const response = await fetch(`/api/admin/pages/${pageToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete page')
      }

      toast({
        title: 'Success',
        description: 'Page deleted successfully',
      })
      
      // Remove the deleted page from the local state
      setPages(prev => prev.filter(p => p.id !== pageToDelete.id))
    } catch (error) {
      console.error('Error deleting page:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setPageToDelete(null)
    }
  }

  const handleRefresh = () => {
    // Simple page reload to get fresh data
    window.location.reload()
  }

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    return status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  // Show loading only if no initial data
  if (pages.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Loading pages...</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted-foreground">
            Manage your website pages and content
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => router.push('/admin/pages/new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Page
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{filteredPages.length} pages</span>
          <span>•</span>
          <span>{pages.filter(p => p.status === 'published').length} published</span>
          <span>•</span>
          <span>{pages.filter(p => p.status === 'draft').length} drafts</span>
        </div>
      </div>

      {/* Pages Grid */}
      {filteredPages.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No pages found' : 'No pages yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Get started by creating your first page'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => router.push('/admin/pages/new')}>
                Create Your First Page
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      {page.title}
                    </CardTitle>
                    <CardDescription className="text-sm font-mono">
                      /{page.slug}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(page.status)}>
                    {page.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(page.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/pages/${page.id}`)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/pages/${page.id}/view`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(page)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <DeletePageDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        page={pageToDelete}
      />
    </div>
  )
}
