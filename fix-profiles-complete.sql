-- Complete fix for profiles table - drops ALL existing policies first
-- This will resolve all naming conflicts

-- Step 1: Drop ALL existing policies on profiles table (comprehensive list)
DROP POLICY IF EXISTS "Allow users to access their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
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
DROP POLICY IF EXISTS "Allow admins to delete all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to read all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to update all data" ON profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Step 2: Drop the problematic function (after dropping all dependent policies)
DROP FUNCTION IF EXISTS is_admin();

-- Step 3: Create a new, simple admin check function
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

-- Step 4: Create clean, new policies with unique names

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid()::uuid);

-- Users can update their own profile  
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid()::uuid);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid()::uuid);

-- Admins can do everything (using simple function)
CREATE POLICY "profiles_admin_full_access" ON profiles
  FOR ALL USING (is_admin_simple());

-- Step 5: Verify the new policies
SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 6: Test the new admin function
SELECT is_admin_simple() as admin_check; 