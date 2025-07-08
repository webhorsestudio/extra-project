-- Create Storage Policies for Avatars Bucket
-- Run this after creating the avatars bucket in the Supabase Dashboard

-- 1. Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies for avatars bucket to start clean
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all avatars" ON storage.objects;

-- 3. Create policies for avatars bucket

-- Policy: Allow authenticated users to upload their own avatars
-- Users can only upload files to their own folder (user_id/filename)
CREATE POLICY "Users can upload own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow users to update their own avatars
CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow public read access to avatars
-- Anyone can view avatar images (for profile pictures, etc.)
CREATE POLICY "Public read access to avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Policy: Allow admins to manage all avatars
-- Admins can upload, update, delete any avatar file
CREATE POLICY "Admins can manage all avatars" ON storage.objects
  FOR ALL USING (
    bucket_id = 'avatars' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::uuid 
      AND role = 'admin'
    )
  );

-- 4. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- 5. Verify the policies were created
SELECT 
  policyname,
  cmd,
  permissive,
  qual as condition
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND qual LIKE '%avatars%'
ORDER BY policyname;

-- 6. Verify the bucket exists
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatars'; 