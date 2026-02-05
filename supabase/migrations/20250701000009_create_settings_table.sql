-- Create settings table for application configuration
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  -- Branding fields
  logo_url TEXT,
  logo_storage_path TEXT,
  favicon_url TEXT,
  favicon_storage_path TEXT,
  logo_alt_text TEXT,
  favicon_alt_text TEXT,
  default_og_image_url TEXT,
  default_og_image_storage_path TEXT,
  
  -- SEO fields
  google_tag_manager_id TEXT,
  robots_txt TEXT,
  sitemap_schedule TEXT DEFAULT 'daily',
  sitemap_enabled BOOLEAN DEFAULT true,
  sitemap_include_properties BOOLEAN DEFAULT true,
  sitemap_include_users BOOLEAN DEFAULT false,
  sitemap_include_blog BOOLEAN DEFAULT true,
  
  -- Theme fields
  accent_color VARCHAR(7) DEFAULT '#06b6d4',
  font_size_base VARCHAR(10) DEFAULT '16px',
  border_radius VARCHAR(10) DEFAULT '8px',
  enable_dark_mode BOOLEAN DEFAULT false,
  enable_animations BOOLEAN DEFAULT true,
  enable_shadows BOOLEAN DEFAULT true,
  
  -- Contact fields
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  contact_website TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at 
  BEFORE UPDATE ON settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_settings_updated_at();

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admin users to manage settings" ON settings;
DROP POLICY IF EXISTS "Allow public read access to public settings" ON settings;

-- Create RLS policies
CREATE POLICY "Allow admin users to manage settings" ON settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create policy for public read access to certain settings
CREATE POLICY "Allow public read access to public settings" ON settings
  FOR SELECT USING (true);

-- Insert default settings record if it doesn't exist
INSERT INTO settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for settings if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('settings', 'settings', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist (using correct syntax)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload settings files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update settings files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete settings files" ON storage.objects;

-- Create storage policy for settings bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'settings');

-- Create storage policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload settings files" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'settings' 
  AND auth.role() = 'authenticated'
);

-- Create storage policy for authenticated users to update their own files
CREATE POLICY "Authenticated users can update settings files" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'settings' 
  AND auth.role() = 'authenticated'
);

-- Create storage policy for authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete settings files" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'settings' 
  AND auth.role() = 'authenticated'
);
