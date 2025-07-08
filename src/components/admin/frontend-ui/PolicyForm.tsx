'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Save, X, Shield, ArrowLeft } from 'lucide-react'
import { RichEditor } from '@/components/admin/blogs/RichEditor'
import { isJsonContent } from '@/lib/content-utils'

interface Policy {
  id?: string
  name: string
  description?: string
  content?: string
  policy_type: string
  is_active: boolean
}

interface PolicyFormProps {
  policy?: Policy
  onSuccess?: () => void
  onCancel?: () => void
}

const POLICY_TYPES = [
  { value: 'privacy', label: 'Privacy Policy', icon: '🔒' },
  { value: 'terms', label: 'Terms of Service', icon: '📋' },
  { value: 'refund', label: 'Refund Policy', icon: '↩️' },
  { value: 'shipping', label: 'Shipping Policy', icon: '📦' },
  { value: 'cancellation', label: 'Cancellation Policy', icon: '❌' },
  { value: 'general', label: 'General Policy', icon: '📄' }
]

export default function PolicyForm({ policy, onSuccess, onCancel }: PolicyFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Policy>({
    name: policy?.name || '',
    description: policy?.description || '',
    content: policy?.content || '',
    policy_type: policy?.policy_type || 'general',
    is_active: policy?.is_active ?? true
  })

  // Update form data when policy prop changes
  useEffect(() => {
    console.log('PolicyForm: Policy prop changed:', policy)
    if (policy) {
      // Handle content conversion
      let content = policy.content || ''
      if (isJsonContent(content)) {
        // Keep JSON format for the editor
        content = content
      }
      
      setFormData({
        name: policy.name || '',
        description: policy.description || '',
        content: content,
        policy_type: policy.policy_type || 'general',
        is_active: policy.is_active ?? true
      })
    } else {
      // Reset form when no policy (creating new)
      setFormData({
        name: '',
        description: '',
        content: '',
        policy_type: 'general',
        is_active: true
      })
    }
  }, [policy])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = policy?.id 
        ? `/api/admin/policies/${policy.id}`
        : '/api/admin/policies'
      
      const method = policy?.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save policy')
      }

      toast({
        title: 'Success',
        description: policy?.id ? 'Policy updated successfully' : 'Policy created successfully',
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error saving policy:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save policy',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedPolicyType = POLICY_TYPES.find(type => type.value === formData.policy_type)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {policy?.id ? 'Edit Policy' : 'Create New Policy'}
            </h1>
            <p className="text-muted-foreground">
              {policy?.id ? 'Update the policy details below' : 'Create a new policy by filling out the form below'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-lg">Policy Information</CardTitle>
          <CardDescription>
            Fill in the basic information for your policy
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Policy Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Policy Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter policy name (e.g., Privacy Policy, Terms of Service)"
                required
                className="h-11"
              />
            </div>

            {/* Policy Type */}
            <div className="space-y-2">
              <Label htmlFor="policy_type" className="text-sm font-medium">
                Policy Type
              </Label>
              <Select
                value={formData.policy_type}
                onValueChange={(value) => setFormData({ ...formData, policy_type: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select policy type" />
                </SelectTrigger>
                <SelectContent>
                  {POLICY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPolicyType && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>{selectedPolicyType.icon}</span>
                  {selectedPolicyType.label}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter a brief description of this policy"
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Optional: A brief description to help identify this policy
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <div className="space-y-1">
                <Label htmlFor="is_active" className="text-sm font-medium">
                  Active Policy
                </Label>
                <p className="text-xs text-muted-foreground">
                  {formData.is_active 
                    ? 'This policy will be visible to users on your website'
                    : 'This policy will be hidden from users'
                  }
                </p>
              </div>
            </div>

            {/* Policy Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                Policy Content *
              </Label>
              <div className="border rounded-lg overflow-hidden">
                <RichEditor
                  content={formData.content || ''}
                  onChange={(content) => setFormData({ ...formData, content })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use the rich text editor above to create your policy content. You can format text, add links, and include lists.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                {policy?.id ? 'Update Policy' : 'Create Policy'}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 