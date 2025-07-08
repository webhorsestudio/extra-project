'use client'

import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { FaWhatsapp } from 'react-icons/fa';

interface EnquiryModalProps {
  trigger: React.ReactNode;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappUrl?: string;
}

export function EnquiryModal({ 
  trigger, 
  companyName = 'Extra Realty',
  contactEmail = '',
  contactPhone = '',
  whatsappUrl = ''
}: EnquiryModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(`I'd like to have more information about properties for sale in Mumbai`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  console.log('Mobile EnquiryModal render - open state:', open, 'company:', companyName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!name.trim()) return setError('Name is required');
    if (!phone.trim()) return setError('Phone is required');
    if (!message.trim()) return setError('Message is required');
    
    setLoading(true);
    
    try {
      console.log('Submitting mobile enquiry for:', companyName, { name, email, phone, message });

      // Only insert fields that exist in the database schema
      const { data, error: insertError } = await supabase
        .from('inquiries')
        .insert([
          {
            name: name.trim(),
            email: email.trim() || 'no-email@example.com', // Required field
            phone: phone.trim(),
            message: message.trim(),
            inquiry_type: 'property',
            status: 'unread',
            subject: `Property inquiry from ${name.trim()} (Mobile)`,
            priority: 'normal',
            source: 'website'
          },
        ])
        .select();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }

      console.log('Mobile enquiry submitted successfully:', data);
      setSuccess(true);
      
      // Reset form and close modal after success
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setName('');
        setEmail('');
        setPhone('');
        setMessage(`I'd like to have more information about properties for sale in Mumbai`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Mobile enquiry submission error:', err);
      setError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate WhatsApp URL based on whatsappUrl prop or fallback to phone number
  const getWhatsAppUrl = () => {
    if (whatsappUrl) {
      // If whatsappUrl is provided, use it directly
      return whatsappUrl;
    } else if (contactPhone) {
      // If no whatsappUrl but contactPhone is provided, create WhatsApp URL with phone
      const cleanPhone = contactPhone.replace(/[^0-9]/g, '');
      return `https://wa.me/${cleanPhone}?text=I'm interested in properties in Mumbai`;
    } else {
      // Fallback to default phone number
      return 'https://wa.me/919876543210?text=I\'m interested in properties in Mumbai';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div onClick={() => {
          console.log('Mobile DialogTrigger clicked, setting open to true');
          setOpen(true);
        }}>
          {trigger}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-sm w-[95vw] rounded-2xl p-6 bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4 text-gray-900">Enquiry About {companyName}</DialogTitle>
        </DialogHeader>
        
        {success ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">✅</div>
            <div className="text-lg font-medium mb-2 text-gray-900">Thank you!</div>
            <div className="text-gray-600 text-sm">Your enquiry has been submitted successfully.</div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Name *"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="rounded-xl border-gray-300 focus:border-black focus:ring-black"
              disabled={loading}
            />
            <Input
              placeholder="E-mail address (optional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              className="rounded-xl border-gray-300 focus:border-black focus:ring-black"
              disabled={loading}
            />
            <Input
              placeholder="Phone *"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className="rounded-xl border-gray-300 focus:border-black focus:ring-black"
              disabled={loading}
            />
            <Textarea
              placeholder="Your message *"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              className="rounded-xl min-h-[80px] border-gray-300 focus:border-black focus:ring-black"
              disabled={loading}
            />
            
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full mt-2 bg-black hover:bg-gray-800 text-white text-base font-medium rounded-full shadow-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Enquiry'
              )}
            </Button>
            
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">Or contact us directly:</div>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                <FaWhatsapp className="text-lg" />
                WhatsApp
              </a>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 