-- First, let's check what policies actually exist
-- This will help us understand the current state before fixing

-- Check all existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'properties', 'inquiries', 'blogs', 'pages', 'settings')
ORDER BY tablename, policyname;

-- Check if is_admin function exists and its definition
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'is_admin';

-- Check the profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for any UUID casting issues in existing policies
SELECT 
  tablename,
  policyname,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'); 