'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { 
  HelpCircle, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { AddFAQForm } from './AddFAQForm'
import { EditFAQForm } from './EditFAQForm'
import { FAQCategoriesList } from './FAQCategoriesList'

interface FAQ {
  id: string
  question: string
  answer: string
  category_id?: string
  category_slug: string
  category_name?: string
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
  created_by?: string
  creator_name?: string
}

interface FAQsClientProps {
  initialFaqs: FAQ[]
}

export default function FAQsClient({ initialFaqs }: FAQsClientProps) {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const { toast } = useToast()

  // Only refetch if initial data is empty (fallback)
  useEffect(() => {
    if (!initialFaqs || initialFaqs.length === 0) {
      fetchFAQs()
    }
  }, [initialFaqs])

  const fetchFAQs = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        category: categoryFilter,
        status: statusFilter
      })

      const response = await fetch(`/api/admin/faqs?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch FAQs')
      }

      const data = await response.json()
      setFaqs(data.faqs || [])
    } catch (error) {
      console.error('Error in fetchFAQs:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch FAQs.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [categoryFilter, statusFilter, toast])

  // Refetch when filters change
  useEffect(() => {
    if (initialFaqs && initialFaqs.length > 0) {
      fetchFAQs()
    }
  }, [fetchFAQs, initialFaqs])

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq)
    setShowEditForm(true)
  }

  const handleDelete = async (faqId: string) => {
    try {
      const response = await fetch(`/api/admin/faqs/${faqId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete FAQ')
      }

      toast({
        title: 'Success',
        description: 'FAQ deleted successfully.',
      })

      fetchFAQs()
    } catch (error) {
      console.error('Error in handleDelete:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete FAQ.',
        variant: 'destructive',
      })
    }
  }

  const handleTogglePublish = async (faqId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/faqs/${faqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_published: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update FAQ status')
      }

      toast({
        title: 'Success',
        description: `FAQ ${!currentStatus ? 'published' : 'unpublished'} successfully.`,
      })

      fetchFAQs()
    } catch (error) {
      console.error('Error in handleTogglePublish:', error)
      toast({
        title: 'Error',
        description: 'Failed to update FAQ status.',
        variant: 'destructive',
      })
    }
  }

  const handleCopyLink = (faqId: string) => {
    const link = `${window.location.origin}/faqs#${faqId}`
    navigator.clipboard.writeText(link)
    toast({
      title: 'Link copied',
      description: 'FAQ link copied to clipboard.',
    })
  }

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'general': 'bg-blue-100 text-blue-800',
      'technical': 'bg-purple-100 text-purple-800',
      'billing': 'bg-green-100 text-green-800',
      'support': 'bg-orange-100 text-orange-800',
      'account': 'bg-red-100 text-red-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Add New FAQ</h1>
          <Button
            variant="outline"
            onClick={() => setShowAddForm(false)}
          >
            Back to FAQs
          </Button>
        </div>
        <AddFAQForm
          onSuccess={() => {
            setShowAddForm(false)
            fetchFAQs()
          }}
          onCancel={() => setShowAddForm(false)}
        />
      </div>
    )
  }

  if (showEditForm && editingFAQ) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Edit FAQ</h1>
          <Button
            variant="outline"
            onClick={() => {
              setShowEditForm(false)
              setEditingFAQ(null)
            }}
          >
            Back to FAQs
          </Button>
        </div>
        <EditFAQForm
          faq={editingFAQ}
          onSuccess={() => {
            setShowEditForm(false)
            setEditingFAQ(null)
            fetchFAQs()
          }}
          onCancel={() => {
            setShowEditForm(false)
            setEditingFAQ(null)
          }}
        />
      </div>
    )
  }

  if (showCategories) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowCategories(false)}
          >
            Back to FAQs
          </Button>
        </div>
        <FAQCategoriesList />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
          <p className="text-muted-foreground">
            Manage frequently asked questions and their categories
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{faqs.length} total</span>
            <span>•</span>
            <span>{faqs.filter(f => f.is_published).length} published</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowCategories(true)}
              className="gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Categories
            </Button>
            
            <Button 
              onClick={() => setShowAddForm(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add FAQ
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="w-full sm:w-[180px]">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-[180px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading FAQs...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredFAQs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No FAQs found' : 'No FAQs yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Get started by creating your first FAQ'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddForm(true)}>
                Create Your First FAQ
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFAQs.map((faq) => (
                  <TableRow key={faq.id}>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="font-medium truncate">{faq.question}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {faq.answer.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(faq.category_slug)}>
                        {faq.category_name || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={faq.is_published ? 'default' : 'secondary'}>
                        {faq.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(faq.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(faq)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePublish(faq.id, faq.is_published)}>
                            {faq.is_published ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLink(faq.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(faq.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 