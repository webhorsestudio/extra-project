-- Fix missing is_admin() function
-- Run this SQL in your Supabase SQL Editor to fix the admin profile loading issue

-- Create the is_admin() function with proper UUID casting
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()::uuid
    AND role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Verify the function was created
SELECT 
  proname as function_name,
  proargtypes as argument_types,
  prorettype as return_type
FROM pg_proc 
WHERE proname = 'is_admin';

-- Test the function (this will return the result for the current user)
SELECT is_admin() as admin_check;

-- Verify RLS policies are working
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname; 