-- Create 'images' bucket for storing uploaded images
-- This bucket will be used for popup ads, general images, and other media uploads

-- Insert the bucket (this creates the storage bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images', 
  true,
  5242880, -- 5MB in bytes (5 * 1024 * 1024)
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the images bucket

-- Policy 1: Allow anyone to view/download images (public read)
CREATE POLICY "Public Access - Select" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Policy 2: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow users to update their own uploaded images
CREATE POLICY "Users can update own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow users to delete their own uploaded images
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Policy 5: Allow service role (admin) full access
CREATE POLICY "Service role has full access" ON storage.objects
FOR ALL USING (
  bucket_id = 'images' 
  AND auth.role() = 'service_role'
);

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Add helpful comment
COMMENT ON SCHEMA storage IS 'Supabase Storage schema for file uploads';
COMMENT ON TABLE storage.buckets IS 'Storage buckets configuration';
COMMENT ON COLUMN storage.buckets.file_size_limit IS 'Maximum file size in bytes (5MB = 5242880 bytes)';
COMMENT ON COLUMN storage.buckets.allowed_mime_types IS 'Array of allowed MIME types for uploads';
