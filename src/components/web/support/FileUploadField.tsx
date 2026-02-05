'use client'

import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'

interface FileUploadFieldProps {
  selectedFile: File | null
  onFileChange: (file: File | null) => void
}

export function FileUploadField({ selectedFile, onFileChange }: FileUploadFieldProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    onFileChange(file)
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label className="text-sm font-medium">Attachment (Optional)</Label>
          <p className="text-xs text-gray-500 mt-1">
            Only JPG, JPEG, PNG and PDF files supported with max size of 50MB.
          </p>
          {selectedFile && (
            <p className="text-sm text-green-600 mt-2">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
        <label className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
          <Upload className="w-6 h-6 text-gray-600" />
          <input
            id="file-input"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}
