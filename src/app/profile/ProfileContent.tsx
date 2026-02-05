"use client"

import React, { useState, useEffect } from 'react'
import { User, Phone, Camera, Save, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ui/use-toast'
import { HydrationSuppressor } from '@/components/HydrationSuppressor'

interface ProfileContentProps {
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

export default function ProfileContent({ user, profile, profileError }: ProfileContentProps) {
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
          ? (accessTest.error as Record<string, unknown>).message || 'Unknown error'
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
        const errorObj = error as { message?: string; details?: string }
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h1>
            <p className="text-gray-600 mb-6">{profileError}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </HydrationSuppressor>
    )
  }

  return (
    <HydrationSuppressor>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="relative mx-auto w-32 h-32 mb-4">
                    <Avatar className="w-32 h-32">
                      <AvatarImage 
                        src={avatarPreview || profile?.avatar_data} 
                        alt={profile?.full_name || 'Profile'} 
                      />
                      <AvatarFallback className="text-2xl">
                        {getInitials(profile?.full_name || user?.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <CardTitle className="text-xl">{profile?.full_name || 'User'}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {profile?.role || 'customer'}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>Member since {profile?.created_at ? 'Active' : 'N/A'}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information and contact details
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={isLoading}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSave}
                          disabled={isLoading}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-500">
                        Email address cannot be changed
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {/* Role (Read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor="role">Account Type</Label>
                      <Input
                        id="role"
                        value={profile?.role || 'customer'}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-500">
                        Account type is managed by administrators
                      </p>
                    </div>

                    {/* Avatar Upload */}
                    {isEditing && (
                      <div className="space-y-2">
                        <Label htmlFor="avatar">Profile Picture</Label>
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </Button>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          {avatarFile && (
                            <span className="text-sm text-gray-600">
                              {avatarFile.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Recommended size: 400x400 pixels, Max size: 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </HydrationSuppressor>
  )
} 