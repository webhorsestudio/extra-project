-- Create storage bucket for location images
-- Note: This needs to be run in the Supabase SQL editor

-- First, create the storage bucket (this needs to be done via the Supabase dashboard)
-- Go to Storage > Create a new bucket
-- Name: location-images
-- Public bucket: true
-- File size limit: 5MB
-- Allowed MIME types: image/*

-- Then run these policies after creating the bucket:

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload location images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'location-images' AND 
  auth.role() = 'authenticated'
);

-- Allow public to view images
CREATE POLICY "Allow public to view location images" ON storage.objects
FOR SELECT USING (bucket_id = 'location-images');

-- Allow authenticated users to delete images
CREATE POLICY "Allow authenticated users to delete location images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'location-images' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update images
CREATE POLICY "Allow authenticated users to update location images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'location-images' AND 
  auth.role() = 'authenticated'
); 