-- Final fix for profiles table RLS infinite recursion
-- This will resolve the issue once and for all

-- Step 1: Disable RLS temporarily to clear all policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Allow admins to delete all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to read all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to update all data" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to delete profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to access their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their profile" ON profiles;

-- Step 3: Drop the problematic is_admin function
DROP FUNCTION IF EXISTS is_admin();

-- Step 4: Create a simple, non-recursive admin check function
CREATE OR REPLACE FUNCTION is_admin_simple()
RETURNS BOOLEAN AS $$
BEGIN
  -- Simple check without recursion
  RETURN auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid()::uuid 
    AND role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create simple, non-conflicting policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid()::uuid);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid()::uuid);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid()::uuid);

-- Allow admins to do everything (using simple function)
CREATE POLICY "Admin full access to profiles" ON profiles
  FOR ALL USING (is_admin_simple());

-- Step 6: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 7: Verify the fix
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
WHERE tablename = 'profiles';

-- Step 8: Test the admin function
SELECT is_admin_simple() as admin_check; 