-- Add sitemap-related columns to settings table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS sitemap_schedule text DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS sitemap_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS sitemap_include_properties boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS sitemap_include_users boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sitemap_include_blog boolean DEFAULT true;

-- Create storage bucket for sitemap if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the public bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

CREATE POLICY "Authenticated users can upload sitemap"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public' AND
  auth.role() = 'authenticated' AND
  name = 'sitemap.xml'
);

CREATE POLICY "Authenticated users can update sitemap"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public' AND
  auth.role() = 'authenticated' AND
  name = 'sitemap.xml'
);

CREATE POLICY "Authenticated users can delete sitemap"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public' AND
  auth.role() = 'authenticated' AND
  name = 'sitemap.xml'
); 