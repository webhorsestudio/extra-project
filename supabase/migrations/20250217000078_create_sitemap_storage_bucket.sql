-- Create storage bucket for sitemap files
-- Note: This migration creates the necessary storage bucket and policies for sitemap generation

-- First, create the storage bucket (this needs to be done via the Supabase dashboard)
-- Go to Storage > Create a new bucket
-- Name: sitemap
-- Public bucket: true
-- File size limit: 1MB
-- Allowed MIME types: text/xml, application/xml

-- Then run these policies after creating the bucket:

-- Drop any existing policies to start clean
DROP POLICY IF EXISTS "Public Access to sitemap" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload sitemap" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update sitemap" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete sitemap" ON storage.objects;

-- Policy 1: Allow public read access to sitemap files
CREATE POLICY "Public Access to sitemap"
ON storage.objects FOR SELECT
USING (bucket_id = 'sitemap');

-- Policy 2: Allow authenticated users to upload sitemap files
CREATE POLICY "Authenticated users can upload sitemap"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sitemap' AND
  auth.role() = 'authenticated' AND
  (name = 'sitemap.xml' OR name LIKE 'sitemap-%')
);

-- Policy 3: Allow authenticated users to update sitemap files
CREATE POLICY "Authenticated users can update sitemap"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'sitemap' AND
  auth.role() = 'authenticated' AND
  (name = 'sitemap.xml' OR name LIKE 'sitemap-%')
);

-- Policy 4: Allow authenticated users to delete sitemap files
CREATE POLICY "Authenticated users can delete sitemap"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'sitemap' AND
  auth.role() = 'authenticated' AND
  (name = 'sitemap.xml' OR name LIKE 'sitemap-%')
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO service_role;

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%sitemap%'
ORDER BY policyname;
