'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { 
  Search, 
  Filter, 
  Eye, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Home,
  DollarSign,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Building2,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react'
import { PropertyInquiry, InquiryStatus, InquiryPriority } from '@/types/inquiry'
import { format } from 'date-fns'

interface PropertyInquiriesClientProps {
  initialInquiries: PropertyInquiry[]
}

export default function PropertyInquiriesClient({ initialInquiries }: PropertyInquiriesClientProps) {
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>(initialInquiries)
  const [filteredInquiries, setFilteredInquiries] = useState<PropertyInquiry[]>(initialInquiries)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<InquiryPriority | 'all'>('all')
  const [selectedInquiry, setSelectedInquiry] = useState<PropertyInquiry | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Filter inquiries based on search and filters
  useEffect(() => {
    let filtered = inquiries

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(inquiry =>
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.property_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.priority === priorityFilter)
    }

    setFilteredInquiries(filtered)
  }, [inquiries, searchTerm, statusFilter, priorityFilter])

  const handleStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
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
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === inquiryId 
            ? { ...inquiry, status: newStatus }
            : inquiry
        )
      )

      toast({
        title: 'Success',
        description: 'Inquiry status updated successfully',
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update inquiry status',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePriorityChange = async (inquiryId: string, newPriority: InquiryPriority) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: newPriority }),
      })

      if (!response.ok) {
        throw new Error('Failed to update priority')
      }

      // Update local state
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === inquiryId 
            ? { ...inquiry, priority: newPriority }
            : inquiry
        )
      )

      toast({
        title: 'Success',
        description: 'Inquiry priority updated successfully',
      })
    } catch (error) {
      console.error('Error updating priority:', error)
      toast({
        title: 'Error',
        description: 'Failed to update inquiry priority',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: InquiryStatus) => {
    switch (status) {
      case 'unread':
        return 'destructive'
      case 'read':
        return 'secondary'
      case 'in_progress':
        return 'default'
      case 'resolved':
        return 'default'
      case 'closed':
        return 'outline'
      case 'spam':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getPriorityBadgeVariant = (priority: InquiryPriority) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'default'
      case 'normal':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: InquiryStatus) => {
    switch (status) {
      case 'unread':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'read':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'spam':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityIcon = (priority: InquiryPriority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'high':
        return <TrendingUp className="h-4 w-4 text-orange-500" />
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'low':
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const openDetailDialog = (inquiry: PropertyInquiry) => {
    setSelectedInquiry(inquiry)
    setIsDetailDialogOpen(true)
  }

  const stats = {
    total: inquiries.length,
    unread: inquiries.filter(i => i.status === 'unread').length,
    inProgress: inquiries.filter(i => i.status === 'in_progress').length,
    resolved: inquiries.filter(i => i.status === 'resolved').length,
    urgent: inquiries.filter(i => i.priority === 'urgent').length,
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Inquiries</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Unread</p>
                <p className="text-2xl font-bold text-red-900">{stats.unread}</p>
              </div>
              <div className="p-2 bg-red-200 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">In Progress</p>
                <p className="text-2xl font-bold text-orange-900">{stats.inProgress}</p>
              </div>
              <div className="p-2 bg-orange-200 rounded-lg">
                <Clock className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Resolved</p>
                <p className="text-2xl font-bold text-green-900">{stats.resolved}</p>
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Urgent</p>
                <p className="text-2xl font-bold text-purple-900">{stats.urgent}</p>
              </div>
              <div className="p-2 bg-purple-200 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InquiryStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as InquiryPriority | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="flex-1"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="flex-1"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Cards
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredInquiries.length} of {inquiries.length} inquiries
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearchTerm('')
            setStatusFilter('all')
            setPriorityFilter('all')
          }}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear Filters
        </Button>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="shadow-lg rounded-xl border border-gray-200">
          <CardHeader>
            <CardTitle>Property Inquiries</CardTitle>
            <CardDescription>
              Manage and track property inquiries from your website
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="min-w-[700px] w-full border-separate border-spacing-0 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 hidden md:table-cell">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 hidden lg:table-cell">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400">No inquiries found.</td>
                    </tr>
                  ) : (
                    filteredInquiries.map((inquiry, idx) => (
                      <tr
                        key={inquiry.id}
                        className={
                          `transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50` +
                          ' border-b border-gray-100 last:border-0'
                        }
                      >
                        <td className="px-6 py-4 align-top">
                          <div className="font-medium text-gray-900">{inquiry.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {inquiry.email}
                          </div>
                          {inquiry.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {inquiry.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top">
                          <Select
                            value={inquiry.status}
                            onValueChange={(value) => handleStatusChange(inquiry.id, value as InquiryStatus)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-full min-w-[120px] max-w-[140px] rounded-md border-gray-300 focus:ring-2 focus:ring-blue-200">
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
                        </td>
                        <td className="px-6 py-4 align-top hidden md:table-cell">
                          <Select
                            value={inquiry.priority}
                            onValueChange={(value) => handlePriorityChange(inquiry.id, value as InquiryPriority)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-[120px] rounded-md border-gray-300 focus:ring-2 focus:ring-blue-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="urgent">Urgent</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-4 align-top hidden lg:table-cell">
                          <div className="text-sm text-gray-500">
                            {format(new Date(inquiry.created_at), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(inquiry.created_at), 'HH:mm')}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailDialog(inquiry)}
                            className="rounded-md border border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-colors"
                          >
                            <Eye className="h-4 w-4 md:mr-1" />
                            <span className="hidden md:inline">View</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {inquiry.email}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(inquiry.status)}
                    {getPriorityIcon(inquiry.priority)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Property Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Home className="h-4 w-4 text-blue-600" />
                    {inquiry.property_name || 'N/A'}
                  </div>
                  {inquiry.property_location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      {inquiry.property_location}
                    </div>
                  )}
                  {inquiry.property_price_range && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-3 w-3" />
                      {inquiry.property_price_range}
                    </div>
                  )}
                </div>

                {/* Configurations */}
                {inquiry.property_configurations && inquiry.property_configurations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Configurations:</p>
                    <div className="flex flex-wrap gap-1">
                      {inquiry.property_configurations.map((config, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {config}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status and Priority */}
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(inquiry.status)}>
                    {inquiry.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant={getPriorityBadgeVariant(inquiry.priority)}>
                    {inquiry.priority}
                  </Badge>
                </div>

                {/* Message Preview */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Message:</p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {inquiry.message}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    {format(new Date(inquiry.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetailDialog(inquiry)}
                    className="hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enhanced Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Inquiry Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the property inquiry
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-sm font-medium">{selectedInquiry.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-sm">{selectedInquiry.email}</p>
                    </div>
                    {selectedInquiry.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-sm">{selectedInquiry.phone}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">Source</label>
                      <p className="text-sm capitalize">{selectedInquiry.source}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Property Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Property Name</label>
                      <p className="text-sm font-medium">{selectedInquiry.property_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-sm">{selectedInquiry.property_location || 'N/A'}</p>
                    </div>
                    {selectedInquiry.property_price_range && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Price Range</label>
                        <p className="text-sm">{selectedInquiry.property_price_range}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">Configurations</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedInquiry.property_configurations?.map((config, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {config}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Message */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={selectedInquiry.message}
                    readOnly
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>

              {/* Status and Priority */}
              <Card>
                <CardHeader>
                  <CardTitle>Status & Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(selectedInquiry.status)} className="text-sm">
                          {selectedInquiry.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Priority</label>
                      <div className="mt-1">
                        <Badge variant={getPriorityBadgeVariant(selectedInquiry.priority)} className="text-sm">
                          {selectedInquiry.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timestamps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Submitted</label>
                      <p className="text-sm">
                        {format(new Date(selectedInquiry.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    {selectedInquiry.updated_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Last Updated</label>
                        <p className="text-sm">
                          {format(new Date(selectedInquiry.updated_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 