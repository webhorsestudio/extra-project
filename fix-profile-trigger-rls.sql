-- Fix RLS policies to allow profile creation trigger to work
-- This script ensures that the handle_new_user() trigger can create profiles

-- Step 1: Drop all existing policies on profiles table
DROP POLICY IF EXISTS "profiles_own_data" ON profiles;
DROP POLICY IF EXISTS "Service role can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Step 2: Create a simple, non-recursive admin check function
CREATE OR REPLACE FUNCTION is_admin_simple()
RETURNS BOOLEAN AS $$
BEGIN
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

-- Step 3: Create policies that allow the trigger to work

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid()::uuid);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid()::uuid);

-- Allow users to insert their own profile (this is crucial for the trigger)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid()::uuid);

-- Allow service role to do everything (for admin operations)
CREATE POLICY "Service role full access" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Allow admins to read all profiles
CREATE POLICY "Admin can read all profiles" ON profiles
  FOR SELECT USING (is_admin_simple());

-- Allow admins to update all profiles
CREATE POLICY "Admin can update all profiles" ON profiles
  FOR UPDATE USING (is_admin_simple());

-- Allow admins to insert profiles
CREATE POLICY "Admin can insert profiles" ON profiles
  FOR INSERT WITH CHECK (is_admin_simple());

-- Allow admins to delete profiles
CREATE POLICY "Admin can delete profiles" ON profiles
  FOR DELETE USING (is_admin_simple());

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_simple() TO authenticated;

-- Step 5: Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- Step 6: Test the trigger function
-- This should work now that we have proper RLS policies
SELECT 
  'Trigger function exists' as test,
  EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user'
  ) as result;

-- Step 7: Check if the trigger exists
SELECT 
  'Trigger exists' as test,
  EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) as result; 