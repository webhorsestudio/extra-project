'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Clock, Building, Globe } from 'lucide-react';

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
  singleColumn?: boolean;
}

export default function SellerContactStep({ formData, updateFormData, singleColumn }: Props) {
  const isFieldValid = (field: keyof SellerFormData) => {
    const value = formData[field];
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return false;
  };

  const requiredFields = ['address', 'city', 'state', 'zipCode', 'country'];
  const completedFields = requiredFields.filter(field => isFieldValid(field as keyof SellerFormData)).length;

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Address Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            Business Address
          </h4>
          
          <div className={`grid gap-4 w-full ${singleColumn ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {/* Street Address */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Street Address *
              </Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => updateFormData({ address: e.target.value })}
                placeholder="123 Business Street"
                className={`transition-all duration-200 ${
                  formData.address && !isFieldValid('address') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : formData.address && isFieldValid('address')
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formData.address && !isFieldValid('address') && (
                <p className="text-red-500 text-xs">Street address is required</p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                City *
              </Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                placeholder="City"
                className={`transition-all duration-200 ${
                  formData.city && !isFieldValid('city') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : formData.city && isFieldValid('city')
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formData.city && !isFieldValid('city') && (
                <p className="text-red-500 text-xs">City is required</p>
              )}
            </div>

            {/* State/Province */}
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                State/Province *
              </Label>
              <Input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => updateFormData({ state: e.target.value })}
                placeholder="State"
                className={`transition-all duration-200 ${
                  formData.state && !isFieldValid('state') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : formData.state && isFieldValid('state')
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formData.state && !isFieldValid('state') && (
                <p className="text-red-500 text-xs">State is required</p>
              )}
            </div>

            {/* ZIP/Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                ZIP/Postal Code *
              </Label>
              <Input
                id="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={(e) => updateFormData({ zipCode: e.target.value })}
                placeholder="12345"
                className={`transition-all duration-200 ${
                  formData.zipCode && !isFieldValid('zipCode') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : formData.zipCode && isFieldValid('zipCode')
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formData.zipCode && !isFieldValid('zipCode') && (
                <p className="text-red-500 text-xs">ZIP code is required</p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Country *
              </Label>
              <Input
                id="country"
                type="text"
                value={formData.country}
                onChange={(e) => updateFormData({ country: e.target.value })}
                placeholder="United States"
                className={`transition-all duration-200 ${
                  formData.country && !isFieldValid('country') 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : formData.country && isFieldValid('country')
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formData.country && !isFieldValid('country') && (
                <p className="text-red-500 text-xs">Country is required</p>
              )}
            </div>
          </div>
        </div>

        {/* Office Hours Section */}
        <div className="bg-blue-50 rounded-lg p-6 w-full">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Office Hours (Optional)
          </h4>
          
          <div className="space-y-2">
            <Label htmlFor="officeHours" className="text-sm font-medium text-gray-700">
              Business Hours
            </Label>
            <Textarea
              id="officeHours"
              value={formData.officeHours}
              onChange={(e) => updateFormData({ officeHours: e.target.value })}
              placeholder="e.g., Monday - Friday: 9:00 AM - 6:00 PM&#10;Saturday: 10:00 AM - 4:00 PM&#10;Sunday: Closed"
              rows={4}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 resize-none"
            />
            <p className="text-xs text-gray-500">
              Let customers know when they can reach you. This information will be displayed on your property listings.
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-50 rounded-lg p-4 w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Address Completion</span>
            <span className="text-sm text-gray-500">
              {completedFields}/5 required fields completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedFields / 5) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Required fields: Street Address, City, State, ZIP Code, Country
          </p>
        </div>

        {/* Address Preview */}
        {completedFields === 5 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
            <h5 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address Preview
            </h5>
            <p className="text-green-800 text-sm">
              {formData.address}<br />
              {formData.city}, {formData.state} {formData.zipCode}<br />
              {formData.country}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 