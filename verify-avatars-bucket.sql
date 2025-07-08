-- Verify Avatars Storage Bucket Setup
-- Run this in your Supabase SQL Editor to check if everything is configured correctly

-- 1. Check if avatars bucket exists
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'avatars';

-- 2. Check storage policies for avatars bucket
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual as condition
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND qual LIKE '%avatars%'
ORDER BY policyname;

-- 3. Check if there are any files in the avatars bucket
SELECT 
  name,
  bucket_id,
  owner,
  created_at,
  updated_at,
  last_accessed_at,
  metadata
FROM storage.objects 
WHERE bucket_id = 'avatars'
ORDER BY created_at DESC;

-- 4. Test if we can create a test policy (this will fail if bucket doesn't exist)
-- This is just a test - we'll drop it immediately
DO $$
BEGIN
  -- Try to create a test policy to verify bucket access
  CREATE POLICY "test_avatars_access" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');
  
  -- If successful, drop the test policy
  DROP POLICY "test_avatars_access" ON storage.objects;
  
  RAISE NOTICE 'Avatars bucket is accessible and policies can be created';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error with avatars bucket: %', SQLERRM;
END $$;

-- 5. Check if the is_admin() function exists (needed for admin policies)
SELECT 
  proname as function_name,
  proargtypes as argument_types,
  prorettype as return_type
FROM pg_proc 
WHERE proname = 'is_admin';

-- 6. Test the is_admin() function
SELECT is_admin() as admin_check; 