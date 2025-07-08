-- Check Storage Setup (No Authentication Required)
-- This will show us if the avatars bucket exists and has proper policies

-- 1. Check if avatars bucket exists
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatars';

-- 2. Check storage policies for avatars bucket
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

-- 3. Check if there are any files in avatars bucket
SELECT 
  name,
  bucket_id,
  created_at,
  metadata
FROM storage.objects 
WHERE bucket_id = 'avatars'
ORDER BY created_at DESC;

-- 4. Show all storage buckets
SELECT 
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
ORDER BY name; 