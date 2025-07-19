'use client'

import { useState } from 'react'
import { Upload, File as FileIcon, Trash2, Download, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'

interface PublicFileUploadProps {
  label: string
  accept: string
  bucket: string
  value?: File | string
  onChange: (file: File | null, url?: string) => void
}

export function PublicFileUpload({ label, accept, bucket, value, onChange }: PublicFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: `${label} file size must be less than 10MB`,
        variant: 'destructive',
      })
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
        toast({
          title: 'Error',
          description: `Failed to upload ${label}: ${error.message}`,
          variant: 'destructive',
        })
        setIsUploading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
      
      if (publicUrlData) {
        onChange(file, publicUrlData.publicUrl)
        toast({
          title: 'Success',
          description: `${label} uploaded successfully!`,
        })
      } else {
        toast({
          title: 'Error',
          description: `Could not get public URL for ${label}.`,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Error',
        description: `Failed to upload ${label}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }
  
  const handleRemoveFile = () => {
    onChange(null)
    toast({
      title: 'Success',
      description: `${label} removed`,
    })
  }

  const isImage = typeof value === 'string' && (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.gif') || value.includes('.webp'))
  const isFile = value instanceof File
  const hasValue = value && (isImage || isFile)

  return (
    <div className="space-y-2 p-3 border rounded-md bg-gray-50/30">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      
      {hasValue ? (
        <div className="space-y-2">
          {isImage ? (
            <div className="relative group">
              <Image 
                src={value as string} 
                alt={label}
                width={80}
                height={80}
                className="w-full h-20 object-cover rounded border"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => window.open(value as string, '_blank')}
                  className="mr-1 h-6 px-2 text-xs bg-white text-gray-700 rounded hover:bg-gray-100 transition-colors"
                >
                  <Eye className="h-3 w-3 mr-1 inline" />
                  View
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = value as string
                    link.download = label
                    link.click()
                  }}
                  className="h-6 px-2 text-xs bg-white text-gray-700 rounded hover:bg-gray-100 transition-colors"
                >
                  <Download className="h-3 w-3 mr-1 inline" />
                  Download
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <FileIcon className="h-5 w-5 text-blue-600" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{label}</p>
                <p className="text-xs text-gray-500">
                  {isFile ? (value as File).name : 'PDF Document'}
                </p>
              </div>
              <div className="flex gap-1">
                {isFile && (
                  <button
                    type="button"
                    onClick={() => {
                      const url = URL.createObjectURL(value as File)
                      window.open(url, '_blank')
                    }}
                    className="h-6 w-6 p-0 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (isFile) {
                      const url = URL.createObjectURL(value as File)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = (value as File).name
                      link.click()
                    } else {
                      const link = document.createElement('a')
                      link.href = value as string
                      link.download = label
                      link.click()
                    }
                  }}
                  className="h-6 w-6 p-0 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Download className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
          
          <button 
            type="button" 
            onClick={handleRemoveFile}
            className="w-full h-6 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center justify-center"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove {label}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="border-2 border-dashed border-gray-300 rounded p-3 text-center hover:border-blue-400 transition-colors">
            <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600 mb-1">Click to upload</p>
            <p className="text-xs text-gray-500 mb-2">Supports: {accept}</p>
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              disabled={isUploading}
              className="text-xs w-full"
            />
          </div>
          {isUploading && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 text-center">Uploading... {progress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 