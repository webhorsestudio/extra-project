'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { File as FileIcon, Trash2, Download, Eye } from 'lucide-react'
import Image from 'next/image'

interface FileUploadProps {
  name: string
  label: string
  accept: string
  bucket: string
}

export function FileUpload({ name, label, accept, bucket }: FileUploadProps) {
  const { setValue, watch } = useFormContext()
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileUrl = watch(name)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${label} file size must be less than 10MB`)
      return
    }

    setIsUploading(true)
    setProgress(0)
    
    // Create a unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    const filePath = `${fileName}`

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (error) {
        console.error('Upload error:', error)
        if (error.message.includes('row-level security policy')) {
          toast.error(`${label} upload failed: Storage permissions not configured. Please contact administrator.`)
        } else {
          toast.error(`Failed to upload ${label}: ${error.message}`)
        }
        setIsUploading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
      
      if (publicUrlData) {
        setValue(name, publicUrlData.publicUrl, { shouldValidate: true })
        toast.success(`${label} uploaded successfully!`)
      } else {
        toast.error(`Could not get public URL for ${label}.`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`Failed to upload ${label}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }
  
  const handleRemoveFile = () => {
    setValue(name, '', { shouldValidate: true })
    toast.success(`${label} removed`)
  }

  const isImage = fileUrl && (fileUrl.includes('.jpg') || fileUrl.includes('.jpeg') || fileUrl.includes('.png') || fileUrl.includes('.gif') || fileUrl.includes('.webp'))

  return (
    <div className="space-y-2 p-3 border rounded-md bg-gray-50/30">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      
      {fileUrl ? (
        <div className="space-y-2">
          {isImage ? (
            <div className="relative group">
              <Image 
                src={fileUrl} 
                alt={label}
                width={80}
                height={80}
                className="w-full h-20 object-cover rounded border"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(fileUrl, '_blank')}
                  className="mr-1 h-6 px-2 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = fileUrl
                    link.download = label
                    link.click()
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <FileIcon className="h-5 w-5 text-blue-600" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{label}</p>
                <p className="text-xs text-gray-500">PDF Document</p>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(fileUrl, '_blank')}
                  className="h-6 w-6 p-0"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = fileUrl
                    link.download = label
                    link.click()
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          
          <Button 
            type="button" 
            variant="destructive" 
            size="sm" 
            onClick={handleRemoveFile}
            className="w-full h-6 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove {label}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center hover:border-blue-400 transition-colors">
            <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600 mb-1">Click to upload</p>
            <p className="text-xs text-gray-500 mb-2">Supports: {accept}</p>
            <Input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              disabled={isUploading}
              className="text-xs"
            />
          </div>
          {isUploading && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 text-center">Uploading... {progress}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 