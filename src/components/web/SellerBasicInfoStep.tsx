'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Mail, Phone, Globe, FileText, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

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

export default function SellerBasicInfoStep({ formData, updateFormData }: Props) {
  const { user, loading: authLoading, error: authError } = useAuth();

  const isFieldValid = (field: keyof SellerFormData) => {
    const value = formData[field];
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return false;
  };

  // If user is logged in, set their email automatically
  useEffect(() => {
    if (user?.email && !formData.email) {
      updateFormData({ email: user.email });
    }
  }, [user?.email, formData.email, updateFormData]);

  return (
    <div className="space-y-6 bg-white/95 border border-gray-200 rounded-xl shadow p-4 md:p-6">
      <div className={`grid gap-4 w-full grid-cols-1 md:grid-cols-2`}>
        {/* Company Name */}
        <div className="mb-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-800 flex items-center gap-1 mb-1">
            <Building2 className="w-4 h-4 text-blue-700" />
            Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="e.g. Acme Realty Pvt Ltd"
            className="py-2 px-3 rounded bg-white border border-gray-300 focus:border-blue-600 focus:shadow transition-all text-sm"
            aria-required="true"
          />
          <p className="text-gray-400 text-xs mt-1">Business name.</p>
          {formData.name && !isFieldValid('name') && (
            <p className="text-red-600 text-xs mt-1">Company name is required</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-800 flex items-center gap-1 mb-1">
            <Mail className="w-4 h-4 text-blue-700" />
            Email <span className="text-red-500">*</span>
          </Label>
          {authLoading ? (
            <div className="py-2 px-3 rounded bg-gray-100 border border-gray-300 text-sm text-gray-500">
              Loading authentication...
            </div>
          ) : authError ? (
            <div className="py-2 px-3 rounded bg-red-50 border border-red-200 text-sm text-red-600">
              Auth error: {authError}
            </div>
          ) : user?.email ? (
            <div className="py-2 px-3 rounded bg-gray-50 border border-gray-300 text-sm text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              {user.email}
              <span className="text-xs text-green-600 font-medium ml-auto">(Logged in)</span>
            </div>
          ) : (
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              placeholder="e.g. contact@yourcompany.com"
              className="py-2 px-3 rounded bg-white border border-gray-300 focus:border-blue-600 focus:shadow transition-all text-sm"
              aria-required="true"
            />
          )}
          <p className="text-gray-400 text-xs mt-1">
            {user?.email ? "Using your account email" : "We'll never share your email."}
          </p>
          {formData.email && !isFieldValid('email') && (
            <p className="text-red-600 text-xs mt-1">Valid email required.</p>
          )}
        </div>

        {/* Phone */}
        <div className="mb-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-800 flex items-center gap-1 mb-1">
            <Phone className="w-4 h-4 text-blue-700" />
            Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            placeholder="e.g. +1 (555) 123-4567"
            className="py-2 px-3 rounded bg-white border border-gray-300 focus:border-blue-600 focus:shadow transition-all text-sm"
            aria-required="true"
          />
          <p className="text-gray-400 text-xs mt-1">Include country code.</p>
          {formData.phone && !isFieldValid('phone') && (
            <p className="text-red-600 text-xs mt-1">Phone required.</p>
          )}
        </div>

        {/* Website */}
        <div className="mb-2">
          <Label htmlFor="website" className="text-sm font-medium text-gray-800 flex items-center gap-1 mb-1">
            <Globe className="w-4 h-4 text-blue-700" />
            Website <span className="text-red-500">*</span>
          </Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => updateFormData({ website: e.target.value })}
            placeholder="e.g. https://www.yourcompany.com"
            className="py-2 px-3 rounded bg-white border border-gray-300 focus:border-blue-600 focus:shadow transition-all text-sm"
            aria-required="true"
          />
          <p className="text-gray-400 text-xs mt-1">Business website.</p>
          {formData.website && !isFieldValid('website') && (
            <p className="text-red-600 text-xs mt-1">Website required.</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mb-2 md:col-span-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-800 flex items-center gap-1 mb-1">
          <FileText className="w-4 h-4 text-blue-700" />
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="About your company, expertise, and what makes you unique..."
          rows={3}
          className="py-2 px-3 rounded bg-white border border-gray-300 focus:border-blue-600 focus:shadow transition-all text-sm resize-none"
          aria-required="true"
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-gray-400 text-xs">Max 500 characters.</p>
          <p className="text-gray-300 text-xs ml-auto">{formData.description.length}/500</p>
        </div>
        {formData.description && !isFieldValid('description') && (
          <p className="text-red-600 text-xs mt-1">Description required.</p>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-50 rounded p-2 w-full mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-700">Step Progress</span>
          <span className="text-xs text-gray-500">
            {Object.keys({ name: formData.name, email: formData.email, phone: formData.phone, website: formData.website, description: formData.description })
              .filter(key => isFieldValid(key as keyof SellerFormData)).length}/5
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.keys({ name: formData.name, email: formData.email, phone: formData.phone, website: formData.website, description: formData.description })
                .filter(key => isFieldValid(key as keyof SellerFormData)).length / 5) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
} 