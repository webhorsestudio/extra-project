-- Create footer_content table
-- This table stores content configuration for the footer

CREATE TABLE IF NOT EXISTS footer_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Company Information
  company_name TEXT DEFAULT 'Extra Realty Private Limited',
  company_tagline TEXT DEFAULT 'Empowering Real Estate Excellence',
  company_description TEXT,
  
  -- Contact Information
  contact_phone TEXT DEFAULT '+91 96068 99667',
  contact_email TEXT,
  contact_address TEXT DEFAULT 'B802, Central Park, Andheri(E), Mumbai - 400069, Maharashtra',
  contact_website TEXT,
  
  -- Social Media Links
  facebook_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  
  -- Call to Action
  cta_title TEXT DEFAULT 'Ready to Find Your Dream Home?',
  cta_subtitle TEXT DEFAULT 'Get in touch with our expert team today',
  cta_button_text TEXT DEFAULT 'Contact Us',
  cta_button_url TEXT DEFAULT '/contact',
  
  -- Copyright Information
  copyright_text TEXT DEFAULT '© 2025 Extra Realty Private Limited - All Rights Reserved',
  designed_by_text TEXT DEFAULT 'Designed by <a href="https://webhorsestudio.com" target="_blank">Webhorse Studio</a>',
  
  -- Navigation Columns (JSON)
  navigation_columns JSONB DEFAULT '[
    {
      "title": "Company",
      "links": [
        {"label": "About Us", "href": "/about", "isActive": true},
        {"label": "Contact Us", "href": "/contact", "isActive": true},
        {"label": "Careers", "href": "/careers", "isActive": false}
      ]
    },
    {
      "title": "Services", 
      "links": [
        {"label": "Buy Property", "href": "/buy", "isActive": true},
        {"label": "Sell Property", "href": "/sell", "isActive": true},
        {"label": "Rent Property", "href": "/rent", "isActive": true}
      ]
    },
    {
      "title": "Support",
      "links": [
        {"label": "FAQs", "href": "/faqs", "isActive": true},
        {"label": "Help Center", "href": "/help", "isActive": false},
        {"label": "Contact Support", "href": "/support", "isActive": true}
      ]
    }
  ]'::jsonb,
  
  -- Policy Links (JSON)
  policy_links JSONB DEFAULT '[
    {"label": "Privacy Policy", "href": "/privacy", "isActive": true},
    {"label": "Terms of Service", "href": "/terms", "isActive": true},
    {"label": "Cookie Policy", "href": "/cookies", "isActive": true},
    {"label": "Refund Policy", "href": "/refund", "isActive": false}
  ]'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_footer_content_active ON footer_content(is_active);
CREATE INDEX IF NOT EXISTS idx_footer_content_created_at ON footer_content(created_at);

-- Enable RLS
ALTER TABLE footer_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Footer content is viewable by everyone" ON footer_content;
DROP POLICY IF EXISTS "Footer content is insertable by admin" ON footer_content;
DROP POLICY IF EXISTS "Footer content is updatable by admin" ON footer_content;
DROP POLICY IF EXISTS "Footer content is deletable by admin" ON footer_content;

-- Create RLS policies
-- Everyone can view active footer content
CREATE POLICY "Footer content is viewable by everyone" ON footer_content
  FOR SELECT USING (is_active = true);

-- Admin can view all footer content
CREATE POLICY "Admin can view all footer content" ON footer_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can insert footer content
CREATE POLICY "Footer content is insertable by admin" ON footer_content
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can update footer content
CREATE POLICY "Footer content is updatable by admin" ON footer_content
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete footer content
CREATE POLICY "Footer content is deletable by admin" ON footer_content
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

CREATE TRIGGER update_footer_content_updated_at 
  BEFORE UPDATE ON footer_content 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default content settings
INSERT INTO footer_content (
  company_name,
  company_tagline,
  company_description,
  contact_phone,
  contact_email,
  contact_address,
  contact_website,
  facebook_url,
  twitter_url,
  linkedin_url,
  instagram_url,
  youtube_url,
  cta_title,
  cta_subtitle,
  cta_button_text,
  cta_button_url,
  copyright_text,
  designed_by_text,
  navigation_columns,
  policy_links,
  is_active
) VALUES (
  'Extra Realty Private Limited',
  'Empowering Real Estate Excellence',
  'Your trusted partner in finding the perfect property. We specialize in residential and commercial real estate across Mumbai and beyond.',
  '+91 96068 99667',
  'info@extrareality.com',
  'B802, Central Park, Andheri(E), Mumbai - 400069, Maharashtra',
  'https://extrareality.com',
  'https://facebook.com/extrareality',
  'https://twitter.com/extrareality',
  'https://linkedin.com/company/extrareality',
  'https://instagram.com/extrareality',
  'https://youtube.com/extrareality',
  'Ready to Find Your Dream Home?',
  'Get in touch with our expert team today',
  'Contact Us',
  '/contact',
  '© 2025 Extra Realty Private Limited - All Rights Reserved',
  'Designed by <a href="https://webhorsestudio.com" target="_blank">Webhorse Studio</a>',
  '[
    {
      "title": "Company",
      "links": [
        {"label": "About Us", "href": "/about", "isActive": true},
        {"label": "Contact Us", "href": "/contact", "isActive": true},
        {"label": "Careers", "href": "/careers", "isActive": false}
      ]
    },
    {
      "title": "Services", 
      "links": [
        {"label": "Buy Property", "href": "/buy", "isActive": true},
        {"label": "Sell Property", "href": "/sell", "isActive": true},
        {"label": "Rent Property", "href": "/rent", "isActive": true}
      ]
    },
    {
      "title": "Support",
      "links": [
        {"label": "FAQs", "href": "/faqs", "isActive": true},
        {"label": "Help Center", "href": "/help", "isActive": false},
        {"label": "Contact Support", "href": "/support", "isActive": true}
      ]
    }
  ]'::jsonb,
  '[
    {"label": "Privacy Policy", "href": "/privacy", "isActive": true},
    {"label": "Terms of Service", "href": "/terms", "isActive": true},
    {"label": "Cookie Policy", "href": "/cookies", "isActive": true},
    {"label": "Refund Policy", "href": "/refund", "isActive": false}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING; 