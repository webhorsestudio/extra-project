-- Create storage bucket for amenity images
-- Note: This needs to be run in the Supabase SQL editor

-- First, create the storage bucket (this needs to be done via the Supabase dashboard)
-- Go to Storage > Create a new bucket
-- Name: amenity-images
-- Public bucket: true
-- File size limit: 5MB
-- Allowed MIME types: image/*

-- Then run these policies after creating the bucket:

-- Allow authenticated users to upload amenity images
CREATE POLICY "Allow authenticated users to upload amenity images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'amenity-images' AND 
  auth.role() = 'authenticated'
);

-- Allow public to view amenity images
CREATE POLICY "Allow public to view amenity images" ON storage.objects
FOR SELECT USING (bucket_id = 'amenity-images');

-- Allow authenticated users to delete amenity images
CREATE POLICY "Allow authenticated users to delete amenity images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'amenity-images' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update amenity images
CREATE POLICY "Allow authenticated users to update amenity images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'amenity-images' AND 
  auth.role() = 'authenticated'
); 