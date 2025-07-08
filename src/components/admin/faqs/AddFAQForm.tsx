'use client'

import { useState } from 'react'
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

interface AddFAQFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AddFAQForm({ onSuccess, onCancel }: AddFAQFormProps) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    order: 1,
    is_published: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

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
      
      const response = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create FAQ')
      }

      toast({
        title: 'Success',
        description: 'FAQ created successfully.',
      })

      onSuccess()
    } catch (error) {
      console.error('Error creating FAQ:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create FAQ.',
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
        <CardTitle>Add New FAQ</CardTitle>
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
              <Label htmlFor="publish">Publish immediately</Label>
              <p className="text-sm text-muted-foreground">
                Make this FAQ visible to users right away
              </p>
            </div>
            <Switch
              id="publish"
              checked={formData.is_published}
              onCheckedChange={(checked) => handleInputChange('is_published', checked)}
            />
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
              {isSubmitting ? 'Creating...' : 'Create FAQ'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 