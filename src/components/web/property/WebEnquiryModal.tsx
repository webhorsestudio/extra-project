import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Property } from '@/types/property';
import { ChevronLeft, ChevronRight, Calendar, Video, Building } from 'lucide-react';

interface WebEnquiryModalProps {
  open: boolean;
  type: 'contact' | 'tour';
  property: Property;
  onClose: () => void;
}

export default function WebEnquiryModal({ open, type, property, onClose }: WebEnquiryModalProps) {
  // Contact form state - config options and state must be declared before useEffect
  const configOptions = property.property_configurations?.map(config => `${config.bhk}BHK`) || ['3BHK', '4BHK'];
  const configState = configOptions.reduce((acc, config) => {
    acc[config] = false;
    return acc;
  }, {} as Record<string, boolean>);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    config: configState,
    message: '',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactMessageType, setContactMessageType] = useState<'success' | 'error' | ''>('');

  // Tour form state
  const [tourForm, setTourForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    siteVisit: false,
    videoChat: false,
  });
  const [tourSubmitting, setTourSubmitting] = useState(false);
  const [tourMessage, setTourMessage] = useState('');
  const [tourMessageType, setTourMessageType] = useState<'success' | 'error' | ''>('');
  const [tourValidationErrors, setTourValidationErrors] = useState<string[]>([]);
  const [dateOffset, setDateOffset] = useState(0);

  // Reset form state when modal opens with different type
  React.useEffect(() => {
    if (open) {
      // Reset forms when modal opens
      setContactForm({
        name: '',
        email: '',
        phone: '',
        config: configState,
        message: '',
      });
      setTourForm({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        siteVisit: false,
        videoChat: false,
      });
      setContactMessage('');
      setContactMessageType('');
      setTourMessage('');
      setTourMessageType('');
      setTourValidationErrors([]);
      setDateOffset(0);
    }
  }, [open, type, configState]);
  
  // Generate dates for navigation (14 days starting from tomorrow)
  const generateDates = (offset: number = 0) => {
    const dates = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1 + offset);
    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate().toString(),
        fullDate: date.toISOString().split('T')[0],
        isToday: i === 0 && offset === 0,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }
    return dates;
  };
  const dates = generateDates(dateOffset);
  const handleDateNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && dateOffset > 0) {
      setDateOffset(prev => prev - 7);
    } else if (direction === 'next') {
      setDateOffset(prev => prev + 7);
    }
  };

  // Time slots
  const timeSlots = [
    { value: '09:00 AM', label: '9:00 AM' },
    { value: '10:00 AM', label: '10:00 AM' },
    { value: '11:00 AM', label: '11:00 AM' },
    { value: '12:00 PM', label: '12:00 PM' },
    { value: '01:00 PM', label: '1:00 PM' },
    { value: '02:00 PM', label: '2:00 PM' },
    { value: '03:00 PM', label: '3:00 PM' },
    { value: '04:00 PM', label: '4:00 PM' },
    { value: '05:00 PM', label: '5:00 PM' },
    { value: '06:00 PM', label: '6:00 PM' },
    { value: '07:00 PM', label: '7:00 PM' },
  ];

  // Handlers for contact form
  const handleContactChange = (field: string, value: unknown) => {
    if (field === 'config') {
      setContactForm((prev) => {
        let newConfig: Record<string, boolean> = {};
        if (
          prev.config && typeof prev.config === 'object' && !Array.isArray(prev.config) &&
          value && typeof value === 'object' && !Array.isArray(value)
        ) {
          newConfig = Object.assign({}, prev.config, value as object) as Record<string, boolean>;
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          newConfig = Object.assign({}, value as object) as Record<string, boolean>;
        } else {
          newConfig = {} as Record<string, boolean>;
        }
        return {
          ...prev,
          config: newConfig,
        };
      });
    } else {
      setContactForm((prev) => ({ ...prev, [field]: value }));
    }
  };
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactMessage('');
    setContactMessageType('');
    try {
      // Simulate API call
      await new Promise(res => setTimeout(res, 1000));
      setContactMessage('Enquiry submitted successfully!');
      setContactMessageType('success');
      setContactForm({
        name: '',
        email: '',
        phone: '',
        config: configState,
        message: '',
      });
      // Close modal after successful submission
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      setContactMessage('Failed to submit enquiry. Please try again.');
      setContactMessageType('error');
    } finally {
      setContactSubmitting(false);
    }
  };

  // Handlers for tour form
  const handleTourChange = (field: string, value: unknown) => {
    setTourForm((prev) => ({ ...prev, [field]: value }));
    if (tourValidationErrors.length > 0) setTourValidationErrors([]);
  };
  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTourMessage('');
    setTourMessageType('');
    setTourValidationErrors([]);
    // Validate
    const errors: string[] = [];
    if (!tourForm.name?.trim()) errors.push('Please enter your name');
    if (!tourForm.email?.trim()) errors.push('Please enter your email address');
    if (!tourForm.date) errors.push('Please select a date for your tour');
    if (!tourForm.time) errors.push('Please select a time for your tour');
    if (!tourForm.siteVisit && !tourForm.videoChat) errors.push('Please select at least one tour type');
    if (errors.length > 0) {
      setTourValidationErrors(errors);
      return;
    }
    setTourSubmitting(true);
    try {
      // Simulate API call
      await new Promise(res => setTimeout(res, 1000));
      setTourMessage('Tour request submitted successfully!');
      setTourMessageType('success');
      setTourForm({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        siteVisit: false,
        videoChat: false,
      });
      // Close modal after successful submission
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      setTourMessage('Failed to submit tour request. Please try again.');
      setTourMessageType('error');
    } finally {
      setTourSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl w-[90vw] rounded-2xl p-0 bg-white border border-gray-200 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">
          {type === 'contact' ? 'Contact Form' : 'Tour Request Form'}
        </DialogTitle>
        <div className="flex items-center justify-center px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-center">
              {type === 'contact' ? 'Contact Now' : 'Request a Tour'}
            </h2>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {type === 'contact' ? (
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <h3 className="text-lg font-bold text-center mb-4">Enquiry About {property.title}</h3>
              {contactMessage && (
                <div className={`mb-4 text-center font-semibold ${contactMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{contactMessage}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
                    value={contactForm.name}
                    onChange={e => handleContactChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
                    value={contactForm.email}
                    onChange={e => handleContactChange('email', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
                  value={contactForm.phone}
                  onChange={e => handleContactChange('phone', e.target.value)}
                  required
                />
              </div>
              {configOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Configuration (select 1 or more)</label>
                  <div className="flex flex-wrap gap-4">
                    {configOptions.map((config) => (
                      <label key={config} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contactForm.config[config]}
                          onChange={e => handleContactChange('config', { [config]: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 focus:ring-[#0A1736]"
                        />
                        {config}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  placeholder={`I'm interested in learning more about ${property.title} in ${property.location_data?.name || property.location}.`}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736] resize-none"
                  rows={4}
                  value={contactForm.message}
                  onChange={e => handleContactChange('message', e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={contactSubmitting}
                className="w-full rounded-lg border border-[#0A1736] text-[#0A1736] font-semibold py-3 mt-4 shadow-sm transition hover:bg-[#0A1736] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {contactSubmitting ? 'Submitting...' : 'Submit Enquiry'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTourSubmit} className="space-y-6">
              <h3 className="text-lg font-bold text-center mb-4">Schedule a Property Tour</h3>
              {tourMessage && (
                <div className={`mb-4 text-center font-semibold ${tourMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{tourMessage}</div>
              )}
              {tourValidationErrors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {tourValidationErrors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
                    value={tourForm.name}
                    onChange={e => handleTourChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
                    value={tourForm.email}
                    onChange={e => handleTourChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (optional)</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
                  value={tourForm.phone}
                  onChange={e => handleTourChange('phone', e.target.value)}
                />
              </div>
              {/* Date Selector with Navigation */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Select Date</label>
                <div className="flex items-center gap-2 justify-center">
                  <button
                    type="button"
                    className={`p-2 rounded-lg transition-colors ${dateOffset > 0 ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                    onClick={() => handleDateNavigation('prev')}
                    disabled={dateOffset === 0}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[400px]">
                    {dates.map((d, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center px-3 py-2 rounded-lg border text-sm font-medium min-w-[60px] cursor-pointer transition-all ${
                          tourForm.date === d.fullDate
                            ? 'bg-[#0A1736] text-white border-[#0A1736] shadow-md'
                            : d.isToday
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : d.isWeekend
                            ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                            : 'bg-white text-[#0A1736] border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleTourChange('date', d.fullDate)}
                      >
                        <span className="text-xs opacity-75">{d.day}</span>
                        <span className="font-semibold">{d.date}</span>
                        {d.isToday && <span className="text-xs mt-1">Today</span>}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    onClick={() => handleDateNavigation('next')}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {/* Time Dropdown */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Select Time</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
                  value={tourForm.time}
                  onChange={e => handleTourChange('time', e.target.value)}
                  required
                >
                  <option value="">Select a Time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Tour Type Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Tour Type (select at least one)</label>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-all ${
                    tourForm.siteVisit
                      ? 'border-[#0A1736] bg-[#0A1736]/5'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={tourForm.siteVisit}
                      onChange={e => handleTourChange('siteVisit', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 focus:ring-[#0A1736]"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <Building className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium">Site Visit</div>
                        <div className="text-sm text-gray-500">Physical tour of the property</div>
                      </div>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-all ${
                    tourForm.videoChat
                      ? 'border-[#0A1736] bg-[#0A1736]/5'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={tourForm.videoChat}
                      onChange={e => handleTourChange('videoChat', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 focus:ring-[#0A1736]"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <Video className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium">Video Chat</div>
                        <div className="text-sm text-gray-500">Virtual tour via video call</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              {/* Tour Summary */}
              {(tourForm.date || tourForm.time || tourForm.siteVisit || tourForm.videoChat) && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Tour Summary:</div>
                  <div className="space-y-2 text-sm text-gray-600">
                    {tourForm.date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Date: {new Date(tourForm.date).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}</span>
                      </div>
                    )}
                    {tourForm.time && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">⏰</span>
                        <span>Time: {tourForm.time}</span>
                      </div>
                    )}
                    {(tourForm.siteVisit || tourForm.videoChat) && (
                      <div className="flex items-center gap-2">
                        <span>Type: </span>
                        <div className="flex gap-2">
                          {tourForm.siteVisit && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Site Visit</span>
                          )}
                          {tourForm.videoChat && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Video Chat</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={tourSubmitting || (!tourForm.siteVisit && !tourForm.videoChat)}
                className="w-full rounded-lg border border-[#0A1736] text-[#0A1736] font-semibold py-3 mt-4 shadow-sm transition hover:bg-[#0A1736] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {tourSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    Confirm Tour Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 