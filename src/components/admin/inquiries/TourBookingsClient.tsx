'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Eye, 
  Mail, 
  Phone, 
  Calendar,
  Clock,
  MapPin,
  Home,
  Video,
  Building,
  MessageSquare
} from 'lucide-react'
import { TourBooking, InquiryStatus, InquiryPriority, TourStatus } from '@/types/inquiry'
import { format } from 'date-fns'

interface TourBookingsClientProps {
  initialBookings: TourBooking[]
}

export default function TourBookingsClient({ initialBookings }: TourBookingsClientProps) {
  const [bookings, setBookings] = useState<TourBooking[]>(initialBookings)
  const [filteredBookings, setFilteredBookings] = useState<TourBooking[]>(initialBookings)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all')
  const [tourStatusFilter, setTourStatusFilter] = useState<TourStatus | 'all'>('all')
  const [selectedBooking, setSelectedBooking] = useState<TourBooking | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Filter bookings based on search and filters
  useEffect(() => {
    let filtered = bookings

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Tour status filter
    if (tourStatusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.tour_status === tourStatusFilter)
    }

    setFilteredBookings(filtered)
  }, [bookings, searchTerm, statusFilter, tourStatusFilter])

  const handleStatusChange = async (bookingId: string, newStatus: InquiryStatus) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/admin/inquiries/${bookingId}`, {
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
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        )
      )

      toast({
        title: 'Success',
        description: 'Booking status updated successfully',
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTourStatusChange = async (bookingId: string, newTourStatus: TourStatus) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/admin/inquiries/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tour_status: newTourStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update tour status')
      }

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, tour_status: newTourStatus }
            : booking
        )
      )

      toast({
        title: 'Success',
        description: 'Tour status updated successfully',
      })
    } catch (error) {
      console.error('Error updating tour status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update tour status',
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

  const getTourStatusBadgeVariant = (status: TourStatus) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'confirmed':
        return 'default'
      case 'completed':
        return 'default'
      case 'cancelled':
        return 'destructive'
      case 'rescheduled':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const openDetailDialog = (booking: TourBooking) => {
    setSelectedBooking(booking)
    setIsDetailDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InquiryStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
        <Select value={tourStatusFilter} onValueChange={(value) => setTourStatusFilter(value as TourStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by tour status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tour Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rescheduled">Rescheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.tour_status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.tour_status === 'confirmed').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => b.tour_status === 'completed').length}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Tour Details</TableHead>
              <TableHead>Tour Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tour Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {booking.email}
                    </div>
                    {booking.phone && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {booking.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {booking.tour_date ? format(new Date(booking.tour_date), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {booking.tour_time || 'N/A'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {booking.tour_type?.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {type === 'site_visit' ? (
                          <Building className="h-3 w-3 mr-1" />
                        ) : (
                          <Video className="h-3 w-3 mr-1" />
                        )}
                        {type.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={booking.status}
                    onValueChange={(value) => handleStatusChange(booking.id, value as InquiryStatus)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[140px]">
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
                </TableCell>
                <TableCell>
                  <Select
                    value={booking.tour_status}
                    onValueChange={(value) => handleTourStatusChange(booking.id, value as TourStatus)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-500">
                    {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-gray-400">
                    {format(new Date(booking.created_at), 'HH:mm')}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetailDialog(booking)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tour Booking Details</DialogTitle>
            <DialogDescription>
              Detailed information about the tour booking
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-sm">{selectedBooking.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm">{selectedBooking.email}</p>
                  </div>
                  {selectedBooking.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-sm">{selectedBooking.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Source</label>
                    <p className="text-sm capitalize">{selectedBooking.source}</p>
                  </div>
                </div>
              </div>

              {/* Tour Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tour Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tour Date</label>
                    <p className="text-sm">
                      {selectedBooking.tour_date ? format(new Date(selectedBooking.tour_date), 'EEEE, MMMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tour Time</label>
                    <p className="text-sm">{selectedBooking.tour_time || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tour Type</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedBooking.tour_type?.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type === 'site_visit' ? (
                            <Building className="h-3 w-3 mr-1" />
                          ) : (
                            <Video className="h-3 w-3 mr-1" />
                          )}
                          {type.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tour Status</label>
                    <Badge variant={getTourStatusBadgeVariant(selectedBooking.tour_status)} className="mt-1">
                      {selectedBooking.tour_status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-gray-600">Message</label>
                <Textarea
                  value={selectedBooking.message}
                  readOnly
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-600">Inquiry Status</label>
                <Badge variant={getStatusBadgeVariant(selectedBooking.status)} className="mt-1">
                  {selectedBooking.status.replace('_', ' ')}
                </Badge>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Submitted</label>
                  <p className="text-sm">
                    {format(new Date(selectedBooking.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                {selectedBooking.updated_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-sm">
                      {format(new Date(selectedBooking.updated_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 