'use client'

import { useState, useCallback, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Search, 
  Filter, 
  Mail, 
  Calendar,
  Phone,
  Building,
  MessageSquare,
  Eye,
  Trash2
} from 'lucide-react'
import { InquiryStatusBadge } from '@/components/admin/inquiries/InquiryStatusBadge'
import { InquiryDetail } from '@/components/admin/inquiries/InquiryDetail'
import { Inquiry } from '@/lib/admin-data'

interface InquiriesClientProps {
  initialInquiries: Inquiry[]
}

export default function InquiriesClient({ initialInquiries }: InquiriesClientProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const pendingDeleteId = useRef<string | null>(null)

  const handleStatusUpdate = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Update local state
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === inquiryId 
          ? { ...inquiry, status: newStatus as Inquiry['status'] }
          : inquiry
      ))

      toast({
        title: 'Status Updated',
        description: 'Inquiry status has been updated successfully.',
      })
    } catch (error) {
      console.error('Error updating inquiry status:', error)
      toast({
        title: 'Update Failed',
        description: 'Failed to update inquiry status. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteInquiry = async (inquiryId: string) => {
    pendingDeleteId.current = inquiryId
    setDeleteDialogOpen(true)
  }

  const confirmDeleteInquiry = async () => {
    const inquiryId = pendingDeleteId.current
    if (!inquiryId) {
      console.error('No inquiry ID found for deletion')
      return
    }
    
    console.log('Attempting to delete inquiry:', inquiryId)
    
    try {
      const url = `/api/admin/inquiries/${inquiryId}`
      console.log('Making DELETE request to:', url)
      
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      console.log('Delete response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Delete failed with status:', response.status, 'Error:', errorText)
        throw new Error(`Failed to delete inquiry: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      console.log('Delete successful:', result)
      
      // Update local state immediately
      setInquiries(prev => prev.filter(i => i.id !== inquiryId))
      
      toast({
        title: 'Deleted',
        description: 'Inquiry deleted successfully',
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete inquiry',
        variant: 'destructive',
      })
    } finally {
      pendingDeleteId.current = null
      setDeleteDialogOpen(false)
    }
  }

  const cancelDelete = () => {
    pendingDeleteId.current = null
    setDeleteDialogOpen(false)
  }

  const openInquiryDetail = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setDetailOpen(true)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <Building className="h-4 w-4" />
      case 'contact':
        return <Mail className="h-4 w-4" />
      case 'support':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'property':
        return 'bg-blue-100 text-blue-800'
      case 'contact':
        return 'bg-green-100 text-green-800'
      case 'support':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter inquiries based on search and filters
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.subject && inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter
    const matchesType = typeFilter === 'all' || inquiry.inquiry_type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Inquiries</h1>
              <p className="text-muted-foreground">
                Manage and respond to property inquiries from potential buyers.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inquiries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Inquiries ({filteredInquiries.length})</CardTitle>
            <CardDescription>
              Showing {filteredInquiries.length} of {inquiries.length} inquiries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInquiries.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No inquiries found</h3>
                <p className="text-muted-foreground">
                  {inquiries.length === 0 
                    ? "No inquiries have been submitted yet."
                    : "No inquiries match your current filters."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{inquiry.name}</h3>
                          <Badge variant="outline" className={getTypeColor(inquiry.inquiry_type)}>
                            <div className="flex items-center gap-1">
                              {getTypeIcon(inquiry.inquiry_type)}
                              {inquiry.inquiry_type}
                            </div>
                          </Badge>
                          <InquiryStatusBadge status={inquiry.status} />
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {inquiry.email}
                          </div>
                          {inquiry.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {inquiry.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {inquiry.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openInquiryDetail(inquiry)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteInquiry(inquiry.id)}
                          title="Delete Inquiry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <Select
                          value={inquiry.status}
                          onValueChange={(value) => handleStatusUpdate(inquiry.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unread">Unread</SelectItem>
                            <SelectItem value="read">Read</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="spam">Spam</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inquiry Detail Modal */}
        {selectedInquiry && (
          <InquiryDetail
            inquiry={selectedInquiry}
            open={detailOpen}
            onOpenChange={setDetailOpen}
            onStatusUpdate={handleStatusUpdate}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Inquiry?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this inquiry? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteInquiry} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
} 