'use client';

import React from 'react';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, ChevronRight, ChevronLeft, Building2, Upload, Phone } from 'lucide-react';
import SellerBasicInfoStep from './SellerBasicInfoStep';
import SellerLogoStep from './SellerLogoStep';
import SellerContactStep from './SellerContactStep';
import { supabase } from '@/lib/supabaseClient';

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

const steps = [
  { id: 1, title: 'Basic Information', icon: Building2, description: 'Company details and contact info' },
  { id: 2, title: 'Company Logo', icon: Upload, description: 'Upload your company logo' },
  { id: 3, title: 'Contact Information', icon: Phone, description: 'Address and office hours' }
];

export default function SellerRegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SellerFormData>({
    name: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    officeHours: '',
    logo: null
  });

  const updateFormData = useCallback((data: Partial<SellerFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          } else {
            formDataToSend.append(key, String(value));
          }
        }
      });

      const response = await fetch('/api/seller-registration', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        // Show success toast message
        toast({
          title: 'Developer Registration Successful!',
          description: 'Your developer account has been created successfully. You can now start adding properties.',
        });
        
        // Auto-login the user after successful registration
        try {
          const { error: authError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: result.user?.password || '', // Use the password returned from API
          });

          if (authError) {
            console.error('Auto-login error:', authError);
            // If auto-login fails, redirect to login page
            toast({
              title: 'Account Created',
              description: 'Please log in with your email to start adding properties.',
            });
            setTimeout(() => {
              router.push('/users/login');
            }, 2000);
          } else {
            // Auto-login successful, redirect to property form
            toast({
              title: 'Welcome!',
              description: 'You have been automatically logged in. Redirecting to property form...',
            });
            setTimeout(() => {
              router.push('/properties/add');
            }, 2000);
          }
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
          // Fallback to login page
          toast({
            title: 'Account Created',
            description: 'Please log in with your email to start adding properties.',
          });
          setTimeout(() => {
            router.push('/users/login');
          }, 2000);
        }
      } else {
        // Show error toast message
        toast({
          title: 'Registration Failed',
          description: result.error || 'Failed to register developer. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error registering developer:', error);
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.phone && formData.website && formData.description;
      case 2:
        return true; // Logo is optional
      case 3:
        return formData.address && formData.city && formData.state && formData.zipCode && formData.country;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

  return (
    <div className="w-full">
      {/* Compact stepper visually integrated with the form */}
      <div className="mb-6">
        <div className="flex flex-row items-center justify-center gap-20 w-full">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center text-center min-w-[110px]">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 mb-1
                    ${currentStep > step.id 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : currentStep === step.id 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-xs font-medium mb-0.5 mt-0.5 text-center whitespace-normal">{step.title}</div>
                  <div className="text-[11px] text-gray-500 leading-tight text-center whitespace-normal">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className="h-10 w-px bg-gray-200 mx-2" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Compact form content, two columns where possible */}
      <div className="space-y-8 px-0 pb-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <SellerBasicInfoStep 
              formData={formData} 
              updateFormData={updateFormData} 
            />
          </div>
        )}
        {currentStep === 2 && (
          <div className="space-y-6">
            <SellerLogoStep 
              formData={formData} 
              updateFormData={updateFormData} 
            />
          </div>
        )}
        {currentStep === 3 && (
          <div className="space-y-6">
            <SellerContactStep 
              formData={formData} 
              updateFormData={updateFormData} 
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-md"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed}
                className="flex items-center gap-2 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm rounded-md shadow"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                className="flex items-center gap-2 px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-md shadow"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Complete Registration
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center mt-6 text-gray-500 text-xs">
        <p>By completing this registration, you agree to our terms of service and privacy policy.</p>
        <p className="mt-1">Need help? Contact our support team.</p>
      </div>
    </div>
  );
} 