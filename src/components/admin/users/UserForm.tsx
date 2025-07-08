'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { User, UpdateUserData } from '@/types/user'
import { User as UserIcon, Save, X, KeyRound } from 'lucide-react'

interface UserFormProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function UserForm({ user, isOpen, onClose, onSave }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [formData, setFormData] = useState<UpdateUserData>({
    full_name: user?.full_name || '',
    role: user?.role || 'customer',
    password: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    // Reset the password field visibility when the user changes
    setShowPasswordField(false)
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      console.log('Updating user with data:', { userId: user.id, formData })
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }

      // Add bypass header for development mode
      if (process.env.NODE_ENV === 'development') {
        headers['x-bypass-auth'] = 'true'
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          full_name: formData.full_name,
          role: formData.role,
          password: formData.password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Update error details:', {
          status: response.status,
          statusText: response.statusText,
          result
        })
        
        toast({
          title: 'Error',
          description: `Failed to update user: ${result.error || 'Unknown error'}`,
          variant: 'destructive',
        })
        return
      }

      console.log('Update successful:', result)
      toast({
        title: 'Success',
        description: 'User updated successfully',
      })

      onSave()
      onClose()
    } catch (error) {
      console.error('Exception updating user:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UpdateUserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              {user ? 'Edit User' : 'New User'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="full_name"
                value={formData.full_name || ''}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role || 'customer'}
                onValueChange={(value) => handleInputChange('role', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!showPasswordField ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordField(true)}
                className="w-full flex items-center gap-2"
              >
                <KeyRound className="h-4 w-4" />
                Change Password
              </Button>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter new password"
                  minLength={6}
                />
                <p className="text-xs text-gray-500">
                  Leave blank to keep the current password.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 