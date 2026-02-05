-- Create storage bucket for branding assets (logo, favicon, etc.)
-- Note: This needs to be run in the Supabase SQL editor

-- First, create the storage bucket (this needs to be done via the Supabase dashboard)
-- Go to Storage > Create a new bucket
-- Name: branding
-- Public bucket: true
-- File size limit: 5MB
-- Allowed MIME types: image/*

-- Then run these policies after creating the bucket:

-- Allow authenticated users to upload branding assets
CREATE POLICY "Allow authenticated users to upload branding assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'branding' AND 
  auth.role() = 'authenticated'
);

-- Allow public to view branding assets
CREATE POLICY "Allow public to view branding assets" ON storage.objects
FOR SELECT USING (bucket_id = 'branding');

-- Allow authenticated users to delete branding assets
CREATE POLICY "Allow authenticated users to delete branding assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'branding' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update branding assets
CREATE POLICY "Allow authenticated users to update branding assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'branding' AND 
  auth.role() = 'authenticated'
); 