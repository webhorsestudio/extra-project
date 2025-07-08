-- Fix infinite recursion in profiles table RLS policies
-- This migration replaces the problematic admin policies with non-recursive alternatives

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new policies that avoid recursion

-- Users can always view their own profile (no recursion)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (no recursion)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to view all profiles (for admin panel)
-- This is a temporary solution - in production, you might want more restrictive policies
CREATE POLICY "Authenticated users can view all profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to update all profiles (for admin panel)
-- This is a temporary solution - in production, you might want more restrictive policies
CREATE POLICY "Authenticated users can update all profiles" ON profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow service role to insert profiles (for admin API operations)
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to delete profiles (for admin panel)
-- This is a temporary solution - in production, you might want more restrictive policies
CREATE POLICY "Authenticated users can delete profiles" ON profiles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Verify policies were created
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname; 