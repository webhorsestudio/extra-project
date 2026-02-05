-- Add default_og_image_storage_path column to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS default_og_image_storage_path TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN settings.default_og_image_storage_path IS 'Storage path for uploaded OG image file (alternative to default_og_image_url)';

-- Create storage bucket for settings if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('settings', 'settings', true)
ON CONFLICT (id) DO NOTHING;

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