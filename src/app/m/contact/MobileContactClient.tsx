"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { CheckCircle, ArrowLeft, Phone, Mail, MapPin, Globe, Clock } from 'lucide-react'
import { HydrationSuppressor } from '@/components/HydrationSuppressor'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactFormSchema>

interface MobileContactClientProps {
  contactInfo: {
    contact_phone?: string
    contact_email?: string
    contact_address?: string
    contact_website?: string
  }
}

export default function MobileContactClient({ contactInfo }: MobileContactClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          inquiry_type: 'contact',
          priority: 'normal',
          source: 'mobile',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit inquiry')
      }

      setIsSuccess(true)
      form.reset()
      
      toast({
        title: 'Message Sent Successfully!',
        description: 'Thank you for contacting us. We will get back to you soon.',
      })
      
      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000)
      
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
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
              <h1 className="text-lg font-semibold text-gray-900">Contact Us</h1>
              <div className="w-16"></div>
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
            <div className="text-center max-w-sm">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600 text-sm">
                Your message has been sent successfully. We will get back to you as soon as possible.
              </p>
              <Button 
                onClick={() => setIsSuccess(false)}
                className="mt-4"
                variant="outline"
                size="sm"
              >
                Send Another Message
              </Button>
            </div>
          </div>
        </div>
      </HydrationSuppressor>
    )
  }

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
            <h1 className="text-lg font-semibold text-gray-900">Contact Us</h1>
            <div className="w-16"></div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Get in Touch</h2>
            <p className="text-gray-600 text-sm">
              Get in touch with our team for any inquiries about properties or services.
            </p>
          </div>

          {/* Contact Form */}
          <Card className="bg-white/90 backdrop-blur-md border-gray-200/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field}
                            disabled={isSubmitting}
                            className="text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter your email address" 
                            {...field}
                            disabled={isSubmitting}
                            className="text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Phone Number *</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="Enter your phone number" 
                            {...field}
                            disabled={isSubmitting}
                            className="text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Subject *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="What is this about?" 
                            {...field}
                            disabled={isSubmitting}
                            className="text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Message *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us how we can help you..." 
                            rows={4}
                            {...field}
                            disabled={isSubmitting}
                            className="text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                    size="sm"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Message'
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By submitting this form, you agree to our privacy policy and terms of service.
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white/90 backdrop-blur-md border-gray-200/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactInfo.contact_phone && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1">Phone</h3>
                    <p className="text-gray-600 text-sm">{contactInfo.contact_phone}</p>
                  </div>
                </div>
              )}
              
              {contactInfo.contact_email && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1">Email</h3>
                    <p className="text-gray-600 text-sm">{contactInfo.contact_email}</p>
                  </div>
                </div>
              )}
              
              {contactInfo.contact_address && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1">Address</h3>
                    <p className="text-gray-600 text-sm">{contactInfo.contact_address}</p>
                  </div>
                </div>
              )}
              
              {contactInfo.contact_website && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Globe className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1">Website</h3>
                    <a 
                      href={contactInfo.contact_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {contactInfo.contact_website}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card className="bg-white/90 backdrop-blur-md border-gray-200/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Business Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monday - Friday</span>
                      <span className="font-medium text-gray-900">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saturday</span>
                      <span className="font-medium text-gray-900">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunday</span>
                      <span className="font-medium text-gray-900">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HydrationSuppressor>
  )
} 