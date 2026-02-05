-- Fix developer-logos storage bucket policies
-- This migration sets up proper storage policies for the developer-logos bucket

-- First, ensure the bucket exists (this should be done manually in Supabase dashboard)
-- The bucket should be named 'developer-logos'

-- Drop any existing policies to start clean
DROP POLICY IF EXISTS "Allow authenticated upload to developer-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read from developer-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from developer-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access to developer-logos" ON storage.objects;

-- Policy 1: Allow authenticated users to upload to developer-logos bucket
CREATE POLICY "Allow authenticated upload to developer-logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'developer-logos' 
  AND auth.role() = 'authenticated'
);

-- Policy 2: Allow authenticated users to read from developer-logos bucket
CREATE POLICY "Allow authenticated read from developer-logos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'developer-logos' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to delete from developer-logos bucket
CREATE POLICY "Allow authenticated delete from developer-logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'developer-logos' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow service role full access to developer-logos bucket
CREATE POLICY "Allow service role full access to developer-logos"
ON storage.objects FOR ALL
USING (auth.role() = 'service_role');

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
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%developer-logos%'
ORDER BY policyname; 