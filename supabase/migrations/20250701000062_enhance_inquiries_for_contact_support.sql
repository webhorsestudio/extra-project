-- Enhance inquiries table for better contact and support management
-- Add new fields to support different types of inquiries

-- Add new columns to inquiries table
ALTER TABLE inquiries 
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website' CHECK (source IN ('website', 'phone', 'email', 'social', 'referral')),
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS response_notes TEXT,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS response_method TEXT CHECK (response_method IN ('email', 'phone', 'sms', 'whatsapp', 'in_person'));

-- Update inquiry_type to include 'support'
ALTER TABLE inquiries 
DROP CONSTRAINT IF EXISTS inquiries_inquiry_type_check;

ALTER TABLE inquiries 
ADD CONSTRAINT inquiries_inquiry_type_check 
CHECK (inquiry_type IN ('property', 'contact', 'support', 'other'));

-- Update status to include more granular states
ALTER TABLE inquiries 
DROP CONSTRAINT IF EXISTS inquiries_status_check;

ALTER TABLE inquiries 
ADD CONSTRAINT inquiries_status_check 
CHECK (status IN ('unread', 'read', 'in_progress', 'resolved', 'closed', 'spam'));

-- Create new indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inquiries_priority ON inquiries(priority);
CREATE INDEX IF NOT EXISTS idx_inquiries_source ON inquiries(source);
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned_to ON inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_inquiries_responded_at ON inquiries(responded_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_type_status ON inquiries(inquiry_type, status);

-- Create function to update responded_at timestamp
CREATE OR REPLACE FUNCTION update_inquiries_responded_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.response_notes IS NOT NULL AND OLD.response_notes IS NULL THEN
    NEW.responded_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for responded_at
DROP TRIGGER IF EXISTS update_inquiries_responded_at ON inquiries;
CREATE TRIGGER update_inquiries_responded_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiries_responded_at();

-- Add comments for documentation
COMMENT ON COLUMN inquiries.subject IS 'Subject/title of the inquiry';
COMMENT ON COLUMN inquiries.priority IS 'Priority level of the inquiry';
COMMENT ON COLUMN inquiries.source IS 'Source/channel where the inquiry originated';
COMMENT ON COLUMN inquiries.assigned_to IS 'Admin user assigned to handle this inquiry';
COMMENT ON COLUMN inquiries.response_notes IS 'Internal notes about the response';
COMMENT ON COLUMN inquiries.responded_at IS 'Timestamp when the inquiry was responded to';
COMMENT ON COLUMN inquiries.response_method IS 'Method used to respond to the inquiry'; 