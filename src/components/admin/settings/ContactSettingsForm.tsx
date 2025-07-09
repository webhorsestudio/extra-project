'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Phone, Mail, MapPin, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Settings } from '@/lib/settings'

type Props = {
  settings: Settings
}

type ContactFormData = {
  contact_email: string
  contact_phone: string
  contact_address: string
}

const contactSchema = z.object({
  contact_email: z.string(),
  contact_phone: z.string(),
  contact_address: z.string(),
})

export function ContactSettingsForm({ settings }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ContactFormData>({
    defaultValues: {
      contact_email: settings?.contact_email || '',
      contact_phone: settings?.contact_phone || '',
      contact_address: settings?.contact_address || '',
    },
    resolver: zodResolver(contactSchema),
  })

  // Watch form values for real-time validation
  const watchedValues = watch()

  // Update form values when settings change
  useEffect(() => {
    setValue('contact_email', settings?.contact_email || '')
    setValue('contact_phone', settings?.contact_phone || '')
    setValue('contact_address', settings?.contact_address || '')
  }, [settings, setValue])

  const validateEmail = (email: string) => {
    if (!email) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    if (!phone) return true
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  const onSubmit = async (data: ContactFormData) => {
    try {
      console.log('Starting contact settings update...')
      setIsLoading(true)

      // Validate email if provided
      if (data.contact_email && !validateEmail(data.contact_email)) {
        throw new Error('Please enter a valid email address')
      }

      // Validate phone if provided
      if (data.contact_phone && !validatePhone(data.contact_phone)) {
        throw new Error('Please enter a valid phone number')
      }

      console.log('Attempting to update settings with:', data)

      // Use API route to update settings
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          contact_address: data.contact_address,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }

      console.log('Settings updated successfully')

      toast({
        title: 'Success',
        description: 'Contact settings updated successfully',
      })
    } catch (error) {
      console.error('Error updating contact settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update contact settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Contact Information Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Contact Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Manage your business contact details and communication channels
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                Contact Email
              </Label>
              <Input
                id="contact_email"
                type="email"
                {...register('contact_email')}
                placeholder="contact@yourcompany.com"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.contact_email && (
                <p className="text-xs text-red-500">{errors.contact_email.message}</p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Primary email for customer inquiries
                </p>
                {watchedValues.contact_email && (
                  <Badge variant={validateEmail(watchedValues.contact_email) ? "default" : "destructive"} className="text-xs">
                    {validateEmail(watchedValues.contact_email) ? "Valid" : "Invalid"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />
                Contact Phone
              </Label>
              <Input
                id="contact_phone"
                type="tel"
                {...register('contact_phone')}
                placeholder="+1 (555) 123-4567"
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
              {errors.contact_phone && (
                <p className="text-xs text-red-500">{errors.contact_phone.message}</p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Primary phone number for support
                </p>
                {watchedValues.contact_phone && (
                  <Badge variant={validatePhone(watchedValues.contact_phone) ? "default" : "destructive"} className="text-xs">
                    {validatePhone(watchedValues.contact_phone) ? "Valid" : "Invalid"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Address Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your business location and physical address details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="contact_address" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              Business Address
            </Label>
            <Textarea
              id="contact_address"
              {...register('contact_address')}
              placeholder="Enter your complete business address..."
              rows={4}
              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 resize-none"
            />
            {errors.contact_address && (
              <p className="text-xs text-red-500">{errors.contact_address.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Full address including street, city, state, and postal code
            </p>
          </div>

          {/* Address Preview */}
          {watchedValues.contact_address && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Address Preview</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {watchedValues.contact_address}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information Summary */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-gray-50 to-blue-50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Globe className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Contact Summary
              </CardTitle>
              <CardDescription className="text-gray-600">
                How your contact information will appear to visitors
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Email Contact</span>
              </div>
              {watchedValues.contact_email ? (
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-900">{watchedValues.contact_email}</p>
                </div>
              ) : (
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-500 italic">No email provided</p>
                </div>
              )}
            </div>

            {/* Phone Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Phone Contact</span>
              </div>
              {watchedValues.contact_phone ? (
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-900">{watchedValues.contact_phone}</p>
                </div>
              ) : (
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-500 italic">No phone provided</p>
                </div>
              )}
            </div>
          </div>

          {/* Address Summary */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Business Address</span>
            </div>
            {watchedValues.contact_address ? (
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-900 whitespace-pre-line">{watchedValues.contact_address}</p>
              </div>
            ) : (
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-500 italic">No address provided</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={isLoading}
          className="bg-black hover:bg-gray-800 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Contact Info'
          )}
        </Button>
      </div>
    </div>
  )
} 