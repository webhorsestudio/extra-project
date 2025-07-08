"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Upload, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { HydrationSuppressor } from '@/components/HydrationSuppressor'

interface MobileSupportClientProps {}

function MobileSupportTabs({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <div className="flex border-b border-gray-200 mb-6 bg-white/90 backdrop-blur-md rounded-lg">
      <Button
        variant="ghost"
        className={`flex-1 px-4 py-3 font-medium border-b-2 transition-colors rounded-none text-sm ${activeTab === 'technical' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        onClick={() => setActiveTab('technical')}
      >
        Technical Support
      </Button>
      <Button
        variant="ghost"
        className={`flex-1 px-4 py-3 font-medium border-b-2 transition-colors rounded-none text-sm ${activeTab === 'legal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        onClick={() => setActiveTab('legal')}
      >
        Legal Issues
      </Button>
    </div>
  )
}

function MobileLegalIssuesList() {
  return (
    <Card className="bg-white/90 backdrop-blur-md border-gray-200/50">
      <CardHeader>
        <CardTitle className="text-base">Legal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900 mb-1">Old Law</div>
            <div className="text-gray-600">Any property used for residential purposes. Examples include single-family homes, condos, cooperatives, duplexes, townhouses, and multifamily residences.</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900 mb-1">Real Estate Law</div>
            <div className="text-gray-600">Any property used exclusively for business purposes, such as apartment complexes, gas stations, grocery stores, hospitals, hotels, offices, parking facilities, restaurants, shopping centers, stores, and theaters.</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900 mb-1">International Law</div>
            <div className="text-gray-600">Any property used for manufacturing, production, distribution, storage, and research and development.</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900 mb-1">Tax Law</div>
            <div className="text-gray-600">Includes undeveloped property, vacant land, and agricultural lands such as farms, orchards, ranches, and timberland.</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900 mb-1">Residential Real Estate</div>
            <div className="text-gray-600">Any property used for residential purposes. Examples include single-family homes, condos, cooperatives, duplexes, townhouses, and multifamily residences.</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900 mb-1">Commercial Real Estate</div>
            <div className="text-gray-600">Any property used exclusively for business purposes, such as apartment complexes, gas stations, grocery stores, hospitals, hotels, offices, parking facilities, restaurants, shopping centers, stores, and theaters.</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900 mb-1">Industrial Real Estate</div>
            <div className="text-gray-600">Any property used for manufacturing, production, distribution, storage, and research and development.</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900 mb-1">Land</div>
            <div className="text-gray-600">Includes undeveloped property, vacant land, and agricultural lands such as farms, orchards, ranches, and timberland.</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900 mb-1">Special Purpose</div>
            <div className="text-gray-600">Property used by the public, such as cemeteries, government buildings, libraries, parks, places of worship, and schools.</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MobileSupportForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    priority: 'normal',
    category: 'technical'
  })
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFile(file || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      })
      return
    }
    
    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('subject', formData.subject)
      formDataToSend.append('message', formData.message)
      formDataToSend.append('priority', formData.priority)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('inquiry_type', 'support')
      if (selectedFile) {
        formDataToSend.append('attachment', selectedFile)
      }
      
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        body: formDataToSend,
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit support request')
      }
      
      setIsSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        priority: 'normal',
        category: 'technical'
      })
      setSelectedFile(null)
      
      toast({
        title: 'Support request submitted',
        description: 'Thank you! We will get back to you soon.',
      })
      
      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000)
      
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'Please try again later',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="text-center max-w-sm">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Support Request Sent!</h3>
          <p className="text-gray-600 text-sm">
            Thank you for contacting our support team. We will get back to you as soon as possible.
          </p>
          <Button 
            onClick={() => setIsSuccess(false)}
            className="mt-4"
            variant="outline"
            size="sm"
          >
            Send Another Request
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-white/90 backdrop-blur-md border-gray-200/50">
      <CardHeader>
        <CardTitle className="text-base">Technical Support Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
                className="text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                disabled={loading}
                className="text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                disabled={loading}
                className="text-sm"
              />
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <Input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Brief description of your issue"
                disabled={loading}
                className="text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <Textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Please describe your issue in detail..."
                rows={4}
                disabled={loading}
                className="text-sm"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={loading}
                size="sm"
                className="text-sm"
              >
                <Upload className="w-4 h-4 mr-1" />
                Choose File
              </Button>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              {selectedFile && (
                <span className="text-xs text-gray-600 truncate">
                  {selectedFile.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 5MB)
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Submit Support Request
              </div>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            We typically respond within 24 hours during business days.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default function MobileSupportClient({}: MobileSupportClientProps) {
  const [activeTab, setActiveTab] = useState('technical')
  
  return (
    <HydrationSuppressor>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <a href="/m" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Back</span>
            </a>
            <h1 className="text-lg font-semibold text-gray-900">Support</h1>
            <div className="w-16"></div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">How can we help?</h2>
            <p className="text-gray-600 text-sm">
              Get technical support or learn about legal information
            </p>
          </div>

          {/* Tabs */}
          <MobileSupportTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Content */}
          {activeTab === 'technical' ? <MobileSupportForm /> : <MobileLegalIssuesList />}
        </div>
      </div>
    </HydrationSuppressor>
  )
} 