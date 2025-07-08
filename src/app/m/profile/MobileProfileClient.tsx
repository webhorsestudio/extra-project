"use client"

import React, { useState, useEffect } from 'react'
import { User, Phone, Camera, Save, X, Upload, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ui/use-toast'
import { HydrationSuppressor } from '@/components/HydrationSuppressor'

interface MobileProfileClientProps {
  user: {
    id: string
    email?: string
  }
  profile: {
    id: string
    full_name?: string
    phone?: string
    avatar_data?: string
    role?: string
    created_at?: string
    updated_at?: string
  } | null
  profileError?: string
}

export default function MobileProfileClient({ user, profile, profileError }: MobileProfileClientProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    avatar_data: profile?.avatar_data || ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        avatar_data: profile.avatar_data || ''
      })
    }
  }, [profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      
      // Create preview as base64
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const testProfileAccess = async () => {
    try {
      console.log('Testing profile access...')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      console.log('Profile access test:', { data, error })
      return { data, error }
    } catch (err) {
      console.error('Profile access test error:', err)
      return { data: null, error: err }
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // First, check if user is authenticated
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !currentUser) {
        throw new Error('Authentication required. Please log in again.')
      }

      if (currentUser.id !== user.id) {
        throw new Error('User session mismatch. Please refresh the page.')
      }

      // Test profile access first
      const accessTest = await testProfileAccess()
      if (accessTest.error) {
        const errorMessage = accessTest.error instanceof Error 
          ? accessTest.error.message 
          : typeof accessTest.error === 'object' && accessTest.error !== null
          ? (accessTest.error as any).message || 'Unknown error'
          : 'Unknown error'
        throw new Error(`Cannot access profile: ${errorMessage}`)
      }

      let avatarData = formData.avatar_data

      // Convert new avatar file to base64 if selected
      if (avatarFile) {
        try {
          avatarData = await fileToBase64(avatarFile)
        } catch (uploadError) {
          console.error('Avatar conversion error:', uploadError)
          throw new Error('Failed to process avatar image')
        }
      }

      console.log('Updating profile with data:', {
        full_name: formData.full_name,
        phone: formData.phone,
        avatar_data: avatarData,
        user_id: user.id
      })

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          avatar_data: avatarData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()

      console.log('Update response:', { data, error })

      if (error) {
        console.error('Supabase update error:', error)
        throw new Error(error.message || 'Failed to update profile')
      }

      if (!data || data.length === 0) {
        throw new Error('No profile was updated. Please check your permissions.')
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })

      setIsEditing(false)
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (error: unknown) {
      console.error('Error updating profile:', error)
      let errorMessage = "Failed to update profile. Please try again."
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // Handle empty error objects
        const errorObj = error as any
        if (errorObj.message) {
          errorMessage = errorObj.message
        } else if (errorObj.details) {
          errorMessage = errorObj.details
        } else if (Object.keys(errorObj).length > 0) {
          errorMessage = JSON.stringify(errorObj)
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      avatar_data: profile?.avatar_data || ''
    })
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (profileError) {
    return (
      <HydrationSuppressor>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <h1 className="text-xl font-bold text-gray-900 mb-3">Error Loading Profile</h1>
            <p className="text-gray-600 mb-6 text-sm">{profileError}</p>
            <Button onClick={() => window.location.reload()} size="sm">
              Try Again
            </Button>
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
            <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Profile Card */}
          <Card className="bg-white/90 backdrop-blur-md border-gray-200/50">
            <CardHeader className="text-center pb-4">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <Avatar className="w-24 h-24 border-2 border-white/50 shadow-sm">
                  <AvatarImage 
                    src={avatarPreview || profile?.avatar_data} 
                    alt={profile?.full_name || 'Profile'} 
                  />
                  <AvatarFallback className="text-xl">
                    {getInitials(profile?.full_name || user?.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-sm">
                    <Camera className="w-3 h-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <CardTitle className="text-lg">{profile?.full_name || 'User'}</CardTitle>
              <CardDescription className="text-sm">{user?.email}</CardDescription>
              <Badge variant="secondary" className="mt-2 text-xs">
                {profile?.role || 'customer'}
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center text-xs text-gray-600">
                  <User className="w-3 h-3 mr-2" />
                  <span>Member since {profile?.created_at ? 'Active' : 'N/A'}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Phone className="w-3 h-3 mr-2" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="bg-white/90 backdrop-blur-md border-gray-200/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Profile Information</CardTitle>
                  <CardDescription className="text-xs">
                    Update your personal information
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={isLoading}
                      size="sm"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={isLoading}
                      size="sm"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                  className="text-sm"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50 text-sm"
                />
                <p className="text-xs text-gray-500">
                  Email address cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                  className="text-sm"
                />
              </div>

              {/* Role (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm">Account Type</Label>
                <Input
                  id="role"
                  value={profile?.role || 'customer'}
                  disabled
                  className="bg-gray-50 text-sm"
                />
                <p className="text-xs text-gray-500">
                  Account type is managed by administrators
                </p>
              </div>

              {/* Avatar Upload */}
              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="text-sm">Profile Picture</Label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      size="sm"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    {avatarFile && (
                      <span className="text-xs text-gray-600 truncate">
                        {avatarFile.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Recommended: 400x400px, Max: 5MB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </HydrationSuppressor>
  )
} 