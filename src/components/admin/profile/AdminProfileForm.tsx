'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Skeleton } from '@/components/ui/skeleton'

export function AdminProfileForm() {
  const { user, profile, loading, error } = useAdminAuth()
  const { toast } = useToast()
  
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Update fullName when profile loads
  if (profile && fullName !== profile.full_name) {
    setFullName(profile.full_name || '')
  }

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = error => reject(error)
    })
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) {
      console.error('No user or profile available')
      return
    }

    console.log('🚀 Starting profile update...', { user: user.id, profile: profile.id })
    setUploading(true)
    let avatar_data = profile.avatar_data

    if (avatarFile) {
      console.log('📁 Avatar file selected:', {
        fileName: avatarFile.name,
        fileSize: avatarFile.size,
        fileType: avatarFile.type
      })

      try {
        // Check file size (limit to 1MB for base64 storage)
        const maxSize = 1024 * 1024 // 1MB
        if (avatarFile.size > maxSize) {
          toast({
            title: 'File too large',
            description: 'Please select an image smaller than 1MB for better performance.',
            variant: 'destructive',
          })
          setUploading(false)
          return
        }

        // Convert file to base64
        console.log('🔄 Converting file to base64...')
        avatar_data = await fileToBase64(avatarFile)
        console.log('✅ File converted to base64, length:', avatar_data.length)

      } catch (conversionError) {
        console.error('❌ File conversion error:', conversionError)
        toast({
          title: 'Error processing image',
          description: 'Failed to process the selected image. Please try again.',
          variant: 'destructive',
        })
        setUploading(false)
        return
      }
    }

    // Update profile in database
    try {
      console.log('💾 Updating profile in database...')
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileUpdateError) {
        console.error('❌ Profile update error:', profileUpdateError)
        toast({
          title: 'Error updating profile',
          description: profileUpdateError.message,
          variant: 'destructive',
        })
        setUploading(false)
        return
      } else {
        console.log('✅ Profile updated successfully')
        
        // Update auth user metadata (optional - profile update is already successful)
        console.log('👤 Updating user metadata (optional)...')
        
        try {
          const { error: updateError } = await supabase.auth.updateUser({
            data: { full_name: fullName },
          })

          console.log('🔍 Auth update result:', { updateError })

          if (updateError) {
            console.warn('⚠️ Auth update warning (non-critical):', updateError.message)
          } else {
            console.log('✅ Auth user updated successfully')
          }
        } catch (authError) {
          console.warn('⚠️ Auth update failed (non-critical):', authError)
        }

        console.log('🎉 All updates completed successfully')

        toast({
          title: 'Profile updated successfully',
          description: 'Your profile has been updated.',
        })
        
        // Clear the file input
        setAvatarFile(null)
        const fileInput = document.getElementById('avatar') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }

        // Reset loading state immediately
        setUploading(false)

        // Refresh the page to show the new avatar
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      toast({
        title: 'Error updating profile',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !user || !profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">User Profile</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {error || 'Unable to load profile information'}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Edit your profile</CardTitle>
          <CardDescription>Update your name and avatar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" type="text" value={profile.role || 'admin'} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)}
              />
              {profile.avatar_data && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Current avatar:</p>
                  <img 
                    src={profile.avatar_data} 
                    alt="Current avatar" 
                    className="w-16 h-16 rounded-full object-cover mt-1"
                    onError={(e) => {
                      console.error('Avatar image failed to load')
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              {avatarFile && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">New avatar selected:</p>
                  <p className="text-xs text-muted-foreground">
                    {avatarFile.name} ({(avatarFile.size / 1024).toFixed(1)} KB)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Maximum file size: 1MB for better performance
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="created">Created</Label>
              <Input 
                id="created" 
                type="text" 
                value={profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'} 
                disabled 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="updated">Last Updated</Label>
              <Input 
                id="updated" 
                type="text" 
                value={profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'} 
                disabled 
              />
            </div>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 