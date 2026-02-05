'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreatePopupAdData } from '@/types/popup-ad'
import { Zap } from 'lucide-react'

interface BasicInfoSectionProps {
  formData: CreatePopupAdData
  onInputChange: (field: string, value: string | number | boolean | string[] | Record<string, unknown>) => void
  onGenerateSlug: () => void
}

export default function BasicInfoSection({ formData, onInputChange, onGenerateSlug }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => onInputChange('title', e.target.value)}
              placeholder="Enter popup ad title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                value={formData.slug || ''}
                onChange={(e) => onInputChange('slug', e.target.value)}
                placeholder="popup-ad-slug"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={onGenerateSlug}
                disabled={!formData.title}
              >
                Generate
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type || 'modal'}
              onValueChange={(value) => onInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="modal">Modal</SelectItem>
                <SelectItem value="toast">Toast</SelectItem>
                <SelectItem value="slide_in">Slide In</SelectItem>
                <SelectItem value="fullscreen">Fullscreen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Select
              value={formData.position || 'center'}
              onValueChange={(value) => onInputChange('position', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top_left">Top Left</SelectItem>
                <SelectItem value="top_right">Top Right</SelectItem>
                <SelectItem value="bottom_left">Bottom Left</SelectItem>
                <SelectItem value="bottom_right">Bottom Right</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top_center">Top Center</SelectItem>
                <SelectItem value="bottom_center">Bottom Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status || 'draft'}
              onValueChange={(value) => onInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Input
              id="priority"
              type="number"
              value={formData.priority || 0}
              onChange={(e) => onInputChange('priority', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
