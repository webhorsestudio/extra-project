'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PersonalInfoFieldsProps {
  name: string
  email: string
  phone: string
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
}

export function PersonalInfoFields({
  name,
  email,
  phone,
  onNameChange,
  onEmailChange,
  onPhoneChange
}: PersonalInfoFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="mt-1"
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
          <Input
            id="email"
            type="text"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="mt-1"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="mt-1"
          placeholder="Enter your phone number (optional)"
        />
      </div>
    </>
  )
}

