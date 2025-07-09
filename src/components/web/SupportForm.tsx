'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { SupportFormHeader } from './support/SupportFormHeader'
import { PersonalInfoFields } from './support/PersonalInfoFields'
import { CategoryPriorityFields } from './support/CategoryPriorityFields'
import { MessageFields } from './support/MessageFields'
import { FileUploadField } from './support/FileUploadField'
import { SubmitButton } from './support/SubmitButton'

export function SupportForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    priority: 'normal',
    category: 'technical'
  })
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  // Handlers for each field
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('subject', formData.subject)
      formDataToSend.append('message', formData.message)
      formDataToSend.append('priority', formData.priority)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('inquiry_type', 'support')
      if (selectedFile) {
        formDataToSend.append('attachment', selectedFile)
      }
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        body: formDataToSend,
      })
      if (!response.ok) {
        throw new Error('Failed to submit support request')
      }
      toast({
        title: 'Support request submitted',
        description: 'Thank you! We will get back to you soon.',
      })
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        priority: 'normal',
        category: 'technical'
      })
      setSelectedFile(null)
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch {
      toast({
        title: 'Submission failed',
        description: 'Please try again later',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto space-y-6">
      <SupportFormHeader />
      <PersonalInfoFields
        name={formData.name}
        email={formData.email}
        phone={formData.phone}
        onNameChange={value => handleInputChange('name', value)}
        onEmailChange={value => handleInputChange('email', value)}
        onPhoneChange={value => handleInputChange('phone', value)}
      />
      <CategoryPriorityFields
        category={formData.category}
        priority={formData.priority}
        onCategoryChange={value => handleInputChange('category', value)}
        onPriorityChange={value => handleInputChange('priority', value)}
      />
      <MessageFields
        subject={formData.subject}
        message={formData.message}
        onSubjectChange={value => handleInputChange('subject', value)}
        onMessageChange={value => handleInputChange('message', value)}
      />
      <FileUploadField
        selectedFile={selectedFile}
        onFileChange={handleFileChange}
      />
      <SubmitButton loading={loading} />
    </form>
  )
}
