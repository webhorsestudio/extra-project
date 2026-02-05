-- Fix RLS policies for inquiries table
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow authenticated users to read inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow authenticated users to update inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow public to insert inquiries" ON inquiries;

-- Recreate policies with proper syntax
CREATE POLICY "Allow authenticated users to read inquiries" ON inquiries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update inquiries" ON inquiries
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow public to insert inquiries (for contact forms)
CREATE POLICY "Allow public to insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- Also allow public to read their own inquiries (optional)
CREATE POLICY "Allow public to read inquiries" ON inquiries
  FOR SELECT USING (true);

-- Add comment for clarity
COMMENT ON TABLE inquiries IS 'Customer inquiries and contact form submissions';
COMMENT ON COLUMN inquiries.inquiry_type IS 'Type of inquiry: property, contact, or other';
COMMENT ON COLUMN inquiries.status IS 'Status of inquiry: unread, read, or resolved'; 