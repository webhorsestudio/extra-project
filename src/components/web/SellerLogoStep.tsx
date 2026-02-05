'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface SellerFormData {
  name: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  officeHours: string;
  logo: File | null;
}

interface Props {
  formData: SellerFormData;
  updateFormData: (data: Partial<SellerFormData>) => void;
}

export default function SellerLogoStep({ formData, updateFormData }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, SVG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file extension
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'svg', 'webp'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert('Please select a valid image file (PNG, JPG, JPEG, SVG, WEBP)');
      return;
    }

    updateFormData({ logo: file });
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeLogo = () => {
    updateFormData({ logo: null });
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Upload Area */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
            ${isDragOver 
              ? 'border-purple-400 bg-purple-50' 
              : formData.logo 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {!formData.logo ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragOver ? 'Drop your logo here' : 'Upload your company logo'}
                </p>
                <p className="text-gray-600 mb-4">
                  Drag and drop an image file, or click to browse
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="bg-white hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                Supported formats: PNG, JPG, JPEG, SVG, WEBP (Max 5MB)
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-lg bg-white border-2 border-green-200 flex items-center justify-center overflow-hidden">
                {previewUrl && (
                  <Image 
                    src={previewUrl} 
                    alt="Logo preview" 
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-lg font-medium text-gray-900">
                    Logo uploaded successfully!
                  </p>
                </div>
                <p className="text-gray-600 mb-4">
                  {formData.logo.name} ({(formData.logo.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLogo();
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove Logo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Logo Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Logo Guidelines
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Recommended size: 300x300 pixels or larger</li>
            <li>• Format: PNG, JPG, JPEG, SVG, or WEBP</li>
            <li>• Maximum file size: 5MB</li>
            <li>• Logo should be clear and recognizable at small sizes</li>
            <li>• Transparent background is preferred</li>
          </ul>
        </div>

        {/* Optional Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Logo upload is optional. You can add or change your logo later in your seller dashboard.
          </p>
        </div>
      </div>
    </div>
  );
} 