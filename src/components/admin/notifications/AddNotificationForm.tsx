'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { useToast } from '@/components/ui/use-toast'
import { Plus } from 'lucide-react'

const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  message: z.string().min(1, 'Message is required').max(500, 'Message must be less than 500 characters'),
  type: z.enum(['info', 'warning', 'error', 'success']),
  category: z.enum(['system', 'user', 'property', 'inquiry'])
})

type NotificationFormData = z.infer<typeof notificationSchema>

interface AddNotificationFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AddNotificationForm({ onSuccess, onCancel }: AddNotificationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: 'info',
      category: 'system'
    }
  })

  const onSubmit = async (data: NotificationFormData) => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create notification')
      }

      const result = await response.json()

      toast({
        title: 'Success',
        description: result.message || 'Notification created successfully!',
      })

      onSuccess()
    } catch (error) {
      console.error('Error in onSubmit:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Enter notification title"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Message *</Label>
          <Textarea
            id="message"
            {...register('message')}
            placeholder="Enter notification message"
            rows={4}
            className={errors.message ? 'border-red-500' : ''}
          />
          {errors.message && (
            <p className="text-sm text-red-500">{errors.message.message}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select
            value={watch('type')}
            onValueChange={(value) => setValue('type', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={watch('category')}
            onValueChange={(value) => setValue('category', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select notification category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="inquiry">Inquiry</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {isLoading ? 'Creating...' : 'Create Notification'}
          </Button>
        </div>
      </form>
    </div>
  )
} 