'use client'

import { EnquiryModal } from './EnquiryModal';

interface EnquiryButtonProps {
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappUrl?: string;
}

export default function EnquiryButton({ 
  companyName = 'Extra Realty',
  contactEmail = '',
  contactPhone = '',
  whatsappUrl = ''
}: EnquiryButtonProps) {
  const handleClick = () => {
    console.log('Enquiry button clicked for:', companyName);
  };

  return (
    <EnquiryModal
      trigger={
        <span
          className="px-8 py-3 rounded-full text-white text-base font-medium shadow-md cursor-pointer"
          style={{
            background: 'linear-gradient(120deg, #181f2c 60%, #a0a3aa 100%)',
            display: 'inline-block',
          }}
          onClick={handleClick}
        >
          Get Started
        </span>
      }
      companyName={companyName}
      contactEmail={contactEmail}
      contactPhone={contactPhone}
      whatsappUrl={whatsappUrl}
    />
  );
} 