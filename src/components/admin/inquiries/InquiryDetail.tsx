'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MessageSquare, 
  CheckCircle,
  Eye,
  AlertCircle,
  XCircle,
  FileText,
  Globe,
  Share2
} from 'lucide-react'
import { InquiryStatusBadge } from './InquiryStatusBadge'
import type { InquiryWithProperty } from '@/types/inquiry'

interface InquiryDetailProps {
  inquiry: InquiryWithProperty | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate: (inquiryId: string, newStatus: string) => Promise<void>
}

export function InquiryDetail({ 
  inquiry, 
  open, 
  onOpenChange, 
  onStatusUpdate 
}: InquiryDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [responseNotes, setResponseNotes] = useState(inquiry?.response_notes || '')
  const [responseMethod, setResponseMethod] = useState(inquiry?.response_method || '')
  const router = useRouter()

  if (!inquiry) return null

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await onStatusUpdate(inquiry.id, newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveResponse = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiry.id}/response`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response_notes: responseNotes,
          response_method: responseMethod,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save response')
      }
    } catch (error) {
      console.error('Error saving response:', error)
    } finally {
      setIsUpdating(false)
    }
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
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'contact':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'support':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'website':
        return <Globe className="h-4 w-4" />
      case 'phone':
        return <Phone className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'social':
        return <Share2 className="h-4 w-4" />
      case 'referral':
        return <User className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                {inquiry.subject || 'Inquiry Details'}
              </DialogTitle>
              <DialogDescription>
                View and manage inquiry information
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <InquiryStatusBadge status={inquiry.status} />
              <Badge variant="outline" className={getPriorityColor(inquiry.priority)}>
                <div className="flex items-center gap-1">
                  {getPriorityIcon(inquiry.priority)}
                  {inquiry.priority}
                </div>
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Inquiry Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Inquiry Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Subject</label>
                  <p className="text-sm font-medium">{inquiry.subject || 'No subject'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <Badge variant="outline" className={getTypeColor(inquiry.inquiry_type)}>
                    {getTypeIcon(inquiry.inquiry_type)}
                    {inquiry.inquiry_type}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Source</label>
                  <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                    {getSourceIcon(inquiry.source)}
                    {inquiry.source}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm">{formatDate(inquiry.created_at)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm">{formatDate(inquiry.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm font-medium">{inquiry.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a 
                      href={`mailto:${inquiry.email}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {inquiry.email}
                    </a>
                  </div>
                </div>
                {inquiry.phone && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`tel:${inquiry.phone}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {inquiry.phone}
                      </a>
                    </div>
                  </div>
                )}
                {inquiry.assigned_user && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Assigned To</label>
                    <p className="text-sm font-medium">{inquiry.assigned_user.full_name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{inquiry.message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Property Information (if applicable) */}
          {inquiry.property && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Related Property
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{inquiry.property.title}</p>
                    <p className="text-sm text-gray-500">ID: {inquiry.property.id}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/properties/${inquiry.property!.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Property
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Response Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Select 
                    value={inquiry.status} 
                    onValueChange={handleStatusUpdate}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Response Method</label>
                  <Select 
                    value={responseMethod} 
                    onValueChange={setResponseMethod}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select response method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Response Notes</label>
                <Textarea
                  placeholder="Add internal notes about the response..."
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  rows={4}
                  disabled={isUpdating}
                />
              </div>

              {inquiry.responded_at && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Responded At</label>
                  <p className="text-sm">{formatDate(inquiry.responded_at)}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveResponse}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save Response'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
