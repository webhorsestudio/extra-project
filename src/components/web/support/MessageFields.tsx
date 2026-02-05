'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface MessageFieldsProps {
  subject: string
  message: string
  onSubjectChange: (value: string) => void
  onMessageChange: (value: string) => void
}

export function MessageFields({
  subject,
  message,
  onSubjectChange,
  onMessageChange
}: MessageFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
        <Input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="mt-1"
          placeholder="Brief description of your issue"
          required
        />
      </div>
      <div>
        <Label htmlFor="message" className="text-sm font-medium">Detailed Description *</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          className="mt-1 min-h-[120px]"
          placeholder="Please provide a detailed description of your issue or question..."
          required
        />
      </div>
    </>
  )
}
