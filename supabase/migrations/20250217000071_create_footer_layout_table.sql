-- Create footer_layout table
-- This table stores layout configuration for the footer

CREATE TABLE IF NOT EXISTS footer_layout (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  column_layout VARCHAR(10) NOT NULL DEFAULT '3',
  show_logo BOOLEAN DEFAULT true,
  show_navigation BOOLEAN DEFAULT true,
  show_contact BOOLEAN DEFAULT true,
  show_social BOOLEAN DEFAULT true,
  show_cta BOOLEAN DEFAULT true,
  show_policy_links BOOLEAN DEFAULT true,
  show_copyright BOOLEAN DEFAULT true,
  spacing VARCHAR(20) DEFAULT 'normal',
  alignment VARCHAR(20) DEFAULT 'left',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_footer_layout_active ON footer_layout(is_active);
CREATE INDEX IF NOT EXISTS idx_footer_layout_created_at ON footer_layout(created_at);

-- Enable RLS
ALTER TABLE footer_layout ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Footer layout is viewable by everyone" ON footer_layout;
DROP POLICY IF EXISTS "Footer layout is insertable by admin" ON footer_layout;
DROP POLICY IF EXISTS "Footer layout is updatable by admin" ON footer_layout;
DROP POLICY IF EXISTS "Footer layout is deletable by admin" ON footer_layout;

-- Create RLS policies
-- Everyone can view active footer layout
CREATE POLICY "Footer layout is viewable by everyone" ON footer_layout
  FOR SELECT USING (is_active = true);

-- Admin can view all footer layout settings
CREATE POLICY "Admin can view all footer layout" ON footer_layout
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can insert footer layout
CREATE POLICY "Footer layout is insertable by admin" ON footer_layout
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can update footer layout
CREATE POLICY "Footer layout is updatable by admin" ON footer_layout
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete footer layout
CREATE POLICY "Footer layout is deletable by admin" ON footer_layout
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

CREATE TRIGGER update_footer_layout_updated_at 
  BEFORE UPDATE ON footer_layout 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default layout settings
INSERT INTO footer_layout (
  column_layout,
  show_logo,
  show_navigation,
  show_contact,
  show_social,
  show_cta,
  show_policy_links,
  show_copyright,
  spacing,
  alignment,
  is_active
) VALUES (
  '3',
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  'normal',
  'left',
  true
) ON CONFLICT DO NOTHING; 