'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'

interface FAQ {
  id: string
  question: string
  answer: string
  category_id?: string
  category_slug: string
  category_name?: string
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
  created_by?: string
  creator_name?: string
}

interface EditFAQFormProps {
  faq: FAQ
  onSuccess: () => void
  onCancel: () => void
}

export function EditFAQForm({ faq, onSuccess, onCancel }: EditFAQFormProps) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    order: 1,
    is_published: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Ensure all values are properly set with fallbacks
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category_slug || 'general',
      order: faq.order_index || 1,
      is_published: faq.is_published || false
    })
  }, [faq])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update FAQ')
      }

      toast({
        title: 'Success',
        description: 'FAQ updated successfully.',
      })

      onSuccess()
    } catch (error) {
      console.error('Error updating FAQ:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update FAQ.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit FAQ</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Input
              id="question"
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              placeholder="Enter the question..."
              required
            />
          </div>

          {/* Answer */}
          <div className="space-y-2">
            <Label htmlFor="answer">Answer *</Label>
            <Textarea
              id="answer"
              value={formData.answer}
              onChange={(e) => handleInputChange('answer', e.target.value)}
              placeholder="Enter the answer..."
              rows={6}
              required
            />
          </div>

          {/* Category and Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
          </div>

          {/* Publish Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="publish">Publish Status</Label>
              <p className="text-sm text-muted-foreground">
                Make this FAQ visible to users
              </p>
            </div>
            <Switch
              id="publish"
              checked={formData.is_published}
              onCheckedChange={(checked) => handleInputChange('is_published', checked)}
            />
          </div>

          {/* FAQ Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Created</Label>
              <p className="text-sm">{new Date(faq.created_at).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Last Updated</Label>
              <p className="text-sm">{new Date(faq.updated_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update FAQ'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 