'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface CategoryPriorityFieldsProps {
  category: string
  priority: string
  onCategoryChange: (value: string) => void
  onPriorityChange: (value: string) => void
}

export function CategoryPriorityFields({
  category,
  priority,
  onCategoryChange,
  onPriorityChange
}: CategoryPriorityFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technical">Technical Support</SelectItem>
            <SelectItem value="billing">Billing & Payment</SelectItem>
            <SelectItem value="account">Account Issues</SelectItem>
            <SelectItem value="feature">Feature Request</SelectItem>
            <SelectItem value="bug">Bug Report</SelectItem>
            <SelectItem value="general">General Inquiry</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="priority" className="text-sm font-medium">Priority *</Label>
        <Select value={priority} onValueChange={onPriorityChange}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
