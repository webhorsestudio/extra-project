'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Building, Globe, MapPin, Phone, Mail, Clock } from 'lucide-react'
import Image from 'next/image'

interface DeveloperFormFieldsProps {
  formData: {
    name: string
    website: string
    address: string
    logo_url: string
    logo_storage_path: string
    contact_info: {
      phone: string
      email: string
      office_hours: string
    }
  }
  onFormDataChange: (data: {
    name: string
    website: string
    address: string
    logo_url: string
    logo_storage_path: string
    contact_info: {
      phone: string
      email: string
      office_hours: string
    }
  }) => void
  isLoading?: boolean
  isUploading?: boolean
  onFileSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile?: () => void
  previewUrl?: string | null
}

export function DeveloperFormFields({
  formData,
  onFormDataChange,
  isLoading = false,
  isUploading = false,
  onFileSelect,
  onRemoveFile,
  previewUrl
}: DeveloperFormFieldsProps) {

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      const parentValue = formData[parent as keyof typeof formData]
      
      // Type guard to ensure parent is an object before spreading
      if (typeof parentValue === 'object' && parentValue !== null) {
        onFormDataChange({
          ...formData,
          [parent]: {
            ...parentValue,
            [child]: value
          }
        })
      }
    } else {
      onFormDataChange({
        ...formData,
        [field]: value
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="developer-name">Seller Name *</Label>
            <Input
              id="developer-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              disabled={isLoading || isUploading}
              placeholder="e.g. Godrej Properties"
            />
          </div>
          
          <div>
            <Label htmlFor="developer-website">Website</Label>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Input
                id="developer-website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={isLoading || isUploading}
                placeholder="https://www.example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="developer-address">Address</Label>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-3" />
              <Textarea
                id="developer-address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={isLoading || isUploading}
                placeholder="Full company address..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Logo Image</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={onFileSelect}
                  disabled={isLoading || isUploading}
                />
                {previewUrl && (
                  <div className="relative">
                    <Image src={previewUrl} alt="Logo Preview" width={48} height={48} className="rounded border object-contain" />
                    <button 
                      type="button" 
                      onClick={onRemoveFile} 
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: Square image, max 5MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="developer-phone">Phone Number</Label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Input
                id="developer-phone"
                type="tel"
                value={formData.contact_info.phone}
                onChange={(e) => handleInputChange('contact_info.phone', e.target.value)}
                disabled={isLoading || isUploading}
                placeholder="+91 1234567890"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="developer-email">Email Address</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                id="developer-email"
                type="email"
                value={formData.contact_info.email}
                onChange={(e) => handleInputChange('contact_info.email', e.target.value)}
                disabled={isLoading || isUploading}
                placeholder="contact@example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="developer-office-hours">Office Hours</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                id="developer-office-hours"
                value={formData.contact_info.office_hours}
                onChange={(e) => handleInputChange('contact_info.office_hours', e.target.value)}
                disabled={isLoading || isUploading}
                placeholder="Mon-Fri: 9 AM - 6 PM"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 