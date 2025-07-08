'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Search, 
  Filter, 
  Mail, 
  Calendar,
  User,
  Phone,
  MessageSquare,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react'
import { InquiryStatusBadge } from './InquiryStatusBadge'
import { InquiryDetail } from './InquiryDetail'
import { Inquiry } from '@/lib/admin-data'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { format } from 'date-fns'

interface ContactInquiry {
  id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  status: 'unread' | 'read' | 'resolved' | 'in_progress' | 'closed' | 'spam'
  inquiry_type: 'contact' | 'property' | 'support' | 'other'
  priority?: string
  source?: string
  created_at: string
  updated_at: string
}

interface ContactInquiriesClientProps {
  initialInquiries: ContactInquiry[]
}

export default function ContactInquiriesClient({ 
  initialInquiries 
}: ContactInquiriesClientProps) {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>(initialInquiries)
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [detailOpen, setDetailOpen] = useState(false)
  const { toast } = useToast()

  // Fetch contact inquiries from API
  const fetchContactInquiries = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        type: 'contact' // Always filter for contact type
      })
      
      console.log('Fetching contact inquiries with params:', params.toString())
      
      const response = await fetch(`/api/admin/inquiries?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch contact inquiries: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Contact inquiries API response:', data)
      
      setInquiries(data.inquiries || [])
    } catch (error) {
      console.error('Error fetching contact inquiries:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch contact inquiries',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, priorityFilter, toast])

  // Fetch inquiries on component mount
  useEffect(() => {
    fetchContactInquiries()
  }, [fetchContactInquiries])

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
          ? { ...inquiry, status: newStatus as ContactInquiry['status'] }
          : inquiry
      ))

      toast({
        title: 'Status Updated',
        description: 'Contact inquiry status has been updated successfully.',
      })
    } catch (error) {
      console.error('Error updating contact inquiry status:', error)
      toast({
        title: 'Update Failed',
        description: 'Failed to update contact inquiry status. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const openInquiryDetail = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry)
    setIsViewDialogOpen(true)
  }

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) {
      return
    }

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to delete inquiry')
      }

      // Refresh the data instead of just updating local state
      await fetchContactInquiries()
      
      toast({
        title: 'Success',
        description: 'Inquiry deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting inquiry:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete inquiry',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'low':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-green-100 text-green-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  // Filter inquiries based on search and filters (only contact type)
  const filteredInquiries = inquiries.filter(inquiry => {
    // Always filter for contact type
    if (inquiry.inquiry_type !== 'contact') return false
    
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.subject && inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || inquiry.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2"></div>
              <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button 
                onClick={fetchContactInquiries}
                className="w-full text-sm"
                variant="outline"
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries List */}
      <Card>
        <CardHeader className="pb-2 border-b">
          <CardTitle className="flex items-center justify-between text-lg font-semibold">
            <span>Contact Inquiries <span className="text-gray-400 font-normal">({filteredInquiries.length})</span></span>
          </CardTitle>
          <CardDescription>
            {filteredInquiries.length === 0 
              ? 'No contact inquiries found' 
              : 'Contact form submissions from your website'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contact inquiries</h3>
              <p className="text-gray-600">
                Contact form submissions will appear here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        {inquiry.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        {inquiry.email}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {inquiry.subject}
                    </TableCell>
                    <TableCell>
                      <Badge variant={inquiry.status === 'unread' ? 'default' : inquiry.status === 'read' ? 'secondary' : 'outline'}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {format(new Date(inquiry.created_at), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openInquiryDetail(inquiry)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteInquiry(inquiry.id)}
                          disabled={isDeleting === inquiry.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contact Inquiry Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">{selectedInquiry.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{selectedInquiry.email}</p>
                </div>
                {selectedInquiry.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900">{selectedInquiry.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge variant={selectedInquiry.status === 'unread' ? 'default' : selectedInquiry.status === 'read' ? 'secondary' : 'outline'}>
                      {selectedInquiry.status.charAt(0).toUpperCase() + selectedInquiry.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Subject</label>
                <p className="text-sm text-gray-900 mt-1">{selectedInquiry.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-500">Created</label>
                  <p className="text-gray-900">
                    {format(new Date(selectedInquiry.created_at), 'PPP p')}
                  </p>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Updated</label>
                  <p className="text-gray-900">
                    {format(new Date(selectedInquiry.updated_at), 'PPP p')}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 