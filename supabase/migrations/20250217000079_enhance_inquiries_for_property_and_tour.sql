-- Enhance inquiries table for property inquiries and tour bookings
-- This migration adds specific fields for property inquiries and tour bookings

-- Add new columns for property inquiries
ALTER TABLE inquiries 
ADD COLUMN IF NOT EXISTS property_configurations TEXT[], -- Array of selected configurations (e.g., ['3BHK', '4BHK'])
ADD COLUMN IF NOT EXISTS property_name TEXT, -- Name of the property being inquired about
ADD COLUMN IF NOT EXISTS property_location TEXT, -- Location of the property
ADD COLUMN IF NOT EXISTS property_price_range TEXT; -- Price range of the property

-- Add new columns for tour bookings
ALTER TABLE inquiries 
ADD COLUMN IF NOT EXISTS tour_date DATE, -- Selected tour date
ADD COLUMN IF NOT EXISTS tour_time TEXT, -- Selected tour time (e.g., '10:00 AM')
ADD COLUMN IF NOT EXISTS tour_type TEXT[], -- Array of tour types (e.g., ['site_visit', 'video_chat'])
ADD COLUMN IF NOT EXISTS tour_status TEXT DEFAULT 'pending' CHECK (tour_status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'));

-- Update inquiry_type to include 'tour_booking'
ALTER TABLE inquiries 
DROP CONSTRAINT IF EXISTS inquiries_inquiry_type_check;

ALTER TABLE inquiries 
ADD CONSTRAINT inquiries_inquiry_type_check 
CHECK (inquiry_type IN ('property', 'contact', 'support', 'tour_booking', 'other'));

-- Create new indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inquiries_property_configurations ON inquiries USING GIN(property_configurations);
CREATE INDEX IF NOT EXISTS idx_inquiries_tour_date ON inquiries(tour_date);
CREATE INDEX IF NOT EXISTS idx_inquiries_tour_status ON inquiries(tour_status);
CREATE INDEX IF NOT EXISTS idx_inquiries_tour_type ON inquiries USING GIN(tour_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_property_name ON inquiries(property_name);

-- Create function to automatically set inquiry_type based on form data
CREATE OR REPLACE FUNCTION set_inquiry_type()
RETURNS TRIGGER AS $$
BEGIN
  -- If tour_date or tour_time is provided, set type to tour_booking
  IF NEW.tour_date IS NOT NULL OR NEW.tour_time IS NOT NULL THEN
    NEW.inquiry_type = 'tour_booking';
  -- If property_configurations is provided, set type to property
  ELSIF NEW.property_configurations IS NOT NULL AND array_length(NEW.property_configurations, 1) > 0 THEN
    NEW.inquiry_type = 'property';
  -- If neither, keep the existing type or default to 'contact'
  ELSIF NEW.inquiry_type IS NULL THEN
    NEW.inquiry_type = 'contact';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set inquiry_type
DROP TRIGGER IF EXISTS set_inquiry_type_trigger ON inquiries;
CREATE TRIGGER set_inquiry_type_trigger
  BEFORE INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION set_inquiry_type();

-- Add comments for documentation
COMMENT ON COLUMN inquiries.property_configurations IS 'Array of selected property configurations (e.g., 3BHK, 4BHK)';
COMMENT ON COLUMN inquiries.property_name IS 'Name of the property being inquired about';
COMMENT ON COLUMN inquiries.property_location IS 'Location of the property';
COMMENT ON COLUMN inquiries.property_price_range IS 'Price range of the property';
COMMENT ON COLUMN inquiries.tour_date IS 'Selected date for property tour';
COMMENT ON COLUMN inquiries.tour_time IS 'Selected time for property tour';
COMMENT ON COLUMN inquiries.tour_type IS 'Array of tour types (site_visit, video_chat)';
COMMENT ON COLUMN inquiries.tour_status IS 'Status of the tour booking (pending, confirmed, completed, cancelled, rescheduled)';

-- Create view for property inquiries
CREATE OR REPLACE VIEW property_inquiries_view AS
SELECT 
  id,
  name,
  email,
  phone,
  subject,
  message,
  property_configurations,
  property_name,
  property_location,
  property_price_range,
  property_id,
  priority,
  status,
  source,
  created_at,
  updated_at
FROM inquiries 
WHERE inquiry_type = 'property' OR (property_configurations IS NOT NULL AND array_length(property_configurations, 1) > 0);

-- Create view for tour bookings
CREATE OR REPLACE VIEW tour_bookings_view AS
SELECT 
  id,
  name,
  email,
  phone,
  subject,
  message,
  tour_date,
  tour_time,
  tour_type,
  tour_status,
  property_id,
  priority,
  status,
  source,
  created_at,
  updated_at
FROM inquiries 
WHERE inquiry_type = 'tour_booking' OR tour_date IS NOT NULL OR tour_time IS NOT NULL;

-- Grant permissions
GRANT SELECT ON property_inquiries_view TO authenticated;
GRANT SELECT ON tour_bookings_view TO authenticated; 