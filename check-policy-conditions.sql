-- Check the actual conditions of RLS policies
-- This will show us if the policies are using the is_admin() function correctly

-- Check profiles table policies with their conditions
SELECT 
  tablename,
  policyname,
  cmd,
  permissive,
  qual as condition,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check if is_admin() function exists
SELECT 
  proname as function_name,
  proargtypes as argument_types,
  prorettype as return_type,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'is_admin';

-- Test the is_admin() function
SELECT is_admin() as admin_check;

-- Check if the function is accessible to authenticated users
SELECT 
  grantee,
  privilege_type
FROM information_schema.routine_privileges 
WHERE routine_name = 'is_admin'; 