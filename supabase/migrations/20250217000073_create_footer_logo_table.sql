-- Create footer_logo table
-- This table stores footer logo configuration and file information

CREATE TABLE IF NOT EXISTS footer_logo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- File Information
  logo_url TEXT,
  logo_storage_path TEXT,
  logo_filename TEXT,
  logo_file_size INTEGER,
  logo_mime_type TEXT,
  
  -- Display Settings
  logo_alt_text TEXT DEFAULT 'Footer Logo',
  logo_width INTEGER DEFAULT 180,
  logo_height INTEGER DEFAULT 56,
  show_logo BOOLEAN DEFAULT true,
  link_to_home BOOLEAN DEFAULT true,
  
  -- Styling
  logo_style VARCHAR(20) DEFAULT 'default', -- default, white, custom
  custom_css TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_footer_logo_active ON footer_logo(is_active);
CREATE INDEX IF NOT EXISTS idx_footer_logo_created_at ON footer_logo(created_at);

-- Enable RLS
ALTER TABLE footer_logo ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Footer logo is viewable by everyone" ON footer_logo;
DROP POLICY IF EXISTS "Footer logo is insertable by admin" ON footer_logo;
DROP POLICY IF EXISTS "Footer logo is updatable by admin" ON footer_logo;
DROP POLICY IF EXISTS "Footer logo is deletable by admin" ON footer_logo;

-- Create RLS policies
-- Everyone can view active footer logo
CREATE POLICY "Footer logo is viewable by everyone" ON footer_logo
  FOR SELECT USING (is_active = true);

-- Admin can view all footer logo settings
CREATE POLICY "Admin can view all footer logo" ON footer_logo
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can insert footer logo
CREATE POLICY "Footer logo is insertable by admin" ON footer_logo
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can update footer logo
CREATE POLICY "Footer logo is updatable by admin" ON footer_logo
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete footer logo
CREATE POLICY "Footer logo is deletable by admin" ON footer_logo
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_footer_logo_updated_at 
  BEFORE UPDATE ON footer_logo 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default footer logo settings
INSERT INTO footer_logo (
  logo_alt_text,
  logo_width,
  logo_height,
  show_logo,
  link_to_home,
  logo_style,
  is_active
) VALUES (
  'Footer Logo',
  180,
  56,
  true,
  true,
  'default',
  true
) ON CONFLICT DO NOTHING; 