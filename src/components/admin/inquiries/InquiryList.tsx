'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
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
  Mail, 
  Calendar,
  Phone,
  Building,
  MessageSquare,
  Eye
} from 'lucide-react'
import { InquiryStatusBadge } from './InquiryStatusBadge'
import { InquiryDetail } from './InquiryDetail'
import type { InquiryWithProperty } from '@/types/inquiry'

export default function InquiryList() {
  const [inquiries, setInquiries] = useState<InquiryWithProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryWithProperty | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const { toast } = useToast()

  const fetchInquiries = useCallback(async () => {
    try {
      console.log('Fetching inquiries...')
      
      // Check if we're using demo credentials
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Missing Supabase environment variables')
        toast({
          title: 'Configuration Error',
          description: 'Supabase credentials not configured. Please check your .env.local file.',
          variant: 'destructive',
        })
        return
      }
      
      // First, let's check if the table exists and get count
      const { data: countData, error: countError } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Count check error:', countError)
        console.error('Error details:', {
          message: countError.message,
          details: countError.details,
          hint: countError.hint,
          code: countError.code
        })
        
        if (countError.code === '42P01') {
          toast({
            title: 'Database Error',
            description: 'Inquiries table does not exist. Please run the setup script.',
            variant: 'destructive',
          })
        } else if (countError.code === '42501') {
          toast({
            title: 'Permission Error',
            description: 'You do not have permission to access the inquiries table. Please check your authentication.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Database Error',
            description: `Failed to access inquiries: ${countError.message}`,
            variant: 'destructive',
          })
        }
        return
      }

      console.log('Table exists, count:', countData?.length || 0)
      
      // Now fetch the actual data
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          property:properties(id, title)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        if (error.code === '42501') {
          toast({
            title: 'Permission Error',
            description: 'You do not have permission to read inquiries. Please check your authentication.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Database Error',
            description: `Failed to fetch inquiries: ${error.message}`,
            variant: 'destructive',
          })
        }
        return
      }
      
      console.log('Inquiries fetched successfully:', data)
      setInquiries(data || [])
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch inquiries',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchInquiries()
  }, [fetchInquiries])

  const handleStatusUpdate = async (inquiryId: string, newStatus: string) => {
    try {
      console.log('Updating inquiry status:', { inquiryId, newStatus })
      
      const { data, error } = await supabase
        .from('inquiries')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiryId)
        .select()

      if (error) {
        console.error('Supabase update error:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        if (error.code === '42501') {
          toast({
            title: 'Permission Error',
            description: 'You do not have permission to update inquiries. Please check your authentication.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Update Error',
            description: `Failed to update inquiry status: ${error.message}`,
            variant: 'destructive',
          })
        }
        return
      }

      console.log('Update successful:', data)
      toast({
        title: 'Success',
        description: 'Inquiry status updated successfully',
      })
      fetchInquiries()
    } catch (error) {
      console.error('Error updating inquiry status:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update inquiry status',
        variant: 'destructive',
      })
    }
  }

  const openInquiryDetail = (inquiry: InquiryWithProperty) => {
    setSelectedInquiry(inquiry)
    setDetailOpen(true)
  }

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter
    const matchesType = typeFilter === 'all' || inquiry.inquiry_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <Building className="h-4 w-4" />
      case 'contact':
        return <Mail className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'property':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'contact':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
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
          <h1 className="text-3xl font-bold tracking-tight">Inquiries</h1>
          <p className="text-muted-foreground">
            Manage customer inquiries and messages
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredInquiries.length} inquiries</span>
          <span>•</span>
          <span>{inquiries.filter(i => i.status === 'unread').length} unread</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="contact">Contact</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inquiries Grid */}
      {filteredInquiries.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'No inquiries found' 
                : 'No inquiries yet'
              }
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Inquiries from your contact forms will appear here'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      {inquiry.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {inquiry.email}
                    </CardDescription>
                  </div>
                  <InquiryStatusBadge status={inquiry.status} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Type Badge */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${getTypeColor(inquiry.inquiry_type)} text-xs`}
                    >
                      {getTypeIcon(inquiry.inquiry_type)}
                      {inquiry.inquiry_type}
                    </Badge>
                    {inquiry.property && (
                      <Badge variant="outline" className="text-xs">
                        Property: {inquiry.property.title}
                      </Badge>
                    )}
                  </div>

                  {/* Message Preview */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {inquiry.message}
                  </p>

                  {/* Contact Info */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {inquiry.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{inquiry.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInquiryDetail(inquiry)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {inquiry.status === 'unread' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(inquiry.id, 'read')}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <InquiryDetail
        inquiry={selectedInquiry}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  )
}
