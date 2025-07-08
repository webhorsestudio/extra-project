import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Property } from '@/types/property';
import { X, ChevronLeft, ChevronRight, Calendar, Video, Building } from 'lucide-react';

interface MobileEnquiryModalProps {
  open: boolean;
  type: 'contact' | 'tour';
  property: Property;
  onClose: () => void;
}

export default function MobileEnquiryModal({ open, type, property, onClose }: MobileEnquiryModalProps) {
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
  }, [open, type]);
  // Contact form state
  const configOptions = property.property_configurations?.map(config => `${config.bhk}BHK`) || ['3BHK', '4BHK'];
  const configState = configOptions.reduce((acc, config) => {
    acc[config] = false;
    return acc;
  }, {} as Record<string, boolean>);
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
  const handleContactChange = (field: string, value: any) => {
    if (field === 'config') {
      setContactForm((prev) => ({
        ...prev,
        config: { ...prev.config, ...value },
      }));
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
  const handleTourChange = (field: string, value: any) => {
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
      <DialogContent className="max-w-sm w-[95vw] max-h-[90vh] rounded-2xl p-0 bg-white border border-gray-200 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">
          {type === 'contact' ? 'Contact Form' : 'Tour Request Form'}
        </DialogTitle>
        <div className="flex items-center justify-center px-4 pt-4 pb-2 border-b border-gray-100 flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-center">
              {type === 'contact' ? 'Contact Now' : 'Request a Tour'}
            </h2>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {type === 'contact' ? (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-center mb-2">Enquiry About {property.title}</h3>
              {contactMessage && (
                <div className={`mb-2 text-center font-semibold ${contactMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{contactMessage}</div>
              )}
              <input
                type="text"
                placeholder="Your Name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
                value={contactForm.name}
                onChange={e => handleContactChange('name', e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="E-mail address (optional)"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
                value={contactForm.email}
                onChange={e => handleContactChange('email', e.target.value)}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
                value={contactForm.phone}
                onChange={e => handleContactChange('phone', e.target.value)}
                required
              />
              {configOptions.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Configuration (select 1 or more)</div>
                  <div className="flex flex-wrap gap-4 mb-2">
                    {configOptions.map((config) => (
                      <label key={config} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contactForm.config[config]}
                          onChange={e => handleContactChange('config', { [config]: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 focus:ring-[#0A1736]"
                        />
                        {config}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <textarea
                placeholder={`I'm interested in learning more about ${property.title} in ${property.location_data?.name || property.location}.`}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736] resize-none"
                rows={3}
                value={contactForm.message}
                onChange={e => handleContactChange('message', e.target.value)}
              />
              <button
                type="submit"
                disabled={contactSubmitting}
                className="w-full rounded-xl border border-[#0A1736] text-[#0A1736] font-semibold py-3 mt-2 shadow-sm transition hover:bg-[#0A1736] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {contactSubmitting ? 'Submitting...' : 'Submit Enquiry'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTourSubmit} className="space-y-3">
              <h3 className="text-base font-bold text-center mb-2">Schedule a Property Tour</h3>
              {tourMessage && (
                <div className={`mb-2 text-center font-semibold ${tourMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{tourMessage}</div>
              )}
              {tourValidationErrors.length > 0 && (
                <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
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
              <input
                type="text"
                placeholder="Your Name *"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
                value={tourForm.name}
                onChange={e => handleTourChange('name', e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email Address *"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
                value={tourForm.email}
                onChange={e => handleTourChange('email', e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
                value={tourForm.phone}
                onChange={e => handleTourChange('phone', e.target.value)}
              />
              {/* Date Selector with Navigation */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Select Date</div>
                <div className="flex items-center gap-1 justify-center">
                  <button
                    type="button"
                    className={`p-1 rounded-lg transition-colors ${dateOffset > 0 ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                    onClick={() => handleDateNavigation('prev')}
                    disabled={dateOffset === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[200px]">
                    {dates.map((d, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center px-1 py-1 rounded-lg border text-xs font-medium min-w-[36px] cursor-pointer transition-all ${
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
                        <span className="text-[8px] opacity-75">{d.day}</span>
                        <span className="font-semibold text-xs">{d.date}</span>
                        {d.isToday && <span className="text-[8px] mt-0.5">Today</span>}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    onClick={() => handleDateNavigation('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Time Dropdown */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Select Time</div>
                <select
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A1736]"
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
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Tour Type (select at least one)</div>
                <div className="space-y-2">
                  <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition-all ${
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
                    <div className="flex items-center gap-2 flex-1">
                      <Building className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="font-medium text-sm">Site Visit</div>
                        <div className="text-xs text-gray-500">Physical tour of the property</div>
                      </div>
                    </div>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition-all ${
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
                    <div className="flex items-center gap-2 flex-1">
                      <Video className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="font-medium text-sm">Video Chat</div>
                        <div className="text-xs text-gray-500">Virtual tour via video call</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              {/* Tour Summary */}
              {(tourForm.date || tourForm.time || tourForm.siteVisit || tourForm.videoChat) && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-medium text-gray-700 mb-1">Tour Summary:</div>
                  <div className="space-y-1 text-xs text-gray-600">
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
                        <div className="flex gap-1">
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
                className="w-full rounded-xl border border-[#0A1736] text-[#0A1736] font-semibold py-3 mt-2 shadow-sm transition hover:bg-[#0A1736] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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