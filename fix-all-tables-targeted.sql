-- Comprehensive fix for all tables - drops all is_admin() dependent policies first
-- This addresses the dependency issue across all tables

-- Step 1: Drop ALL policies that depend on is_admin() function

-- PROPERTIES TABLE
DROP POLICY IF EXISTS "Allow admins to read all data" ON properties;
DROP POLICY IF EXISTS "Allow admins to update all data" ON properties;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON properties;

-- INQUIRIES TABLE
DROP POLICY IF EXISTS "Allow admins to read all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to update all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON inquiries;

-- PROFILES TABLE
DROP POLICY IF EXISTS "Allow admins to read all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to update all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON profiles;

-- BLOGS TABLE
DROP POLICY IF EXISTS "Allow admins to read all data" ON blogs;
DROP POLICY IF EXISTS "Allow admins to update all data" ON blogs;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON blogs;

-- PAGES TABLE
DROP POLICY IF EXISTS "Allow admins to read all data" ON pages;
DROP POLICY IF EXISTS "Allow admins to update all data" ON pages;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON pages;

-- SETTINGS TABLE
DROP POLICY IF EXISTS "Allow admins to read all data" ON settings;
DROP POLICY IF EXISTS "Allow admins to update all data" ON settings;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON settings;

-- Step 2: Now we can safely drop the problematic function
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

-- Step 4: Fix profiles table policies (remove duplicates and recursive ones)
DROP POLICY IF EXISTS "Allow users to access their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their profile" ON profiles;

-- Create clean profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid()::uuid);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid()::uuid);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid()::uuid);

CREATE POLICY "Admin full access to profiles" ON profiles
  FOR ALL USING (is_admin_simple());

-- Step 5: Recreate admin policies for all other tables with new function

-- PROPERTIES TABLE
CREATE POLICY "Admin full access to properties" ON properties
  FOR ALL USING (is_admin_simple());

-- INQUIRIES TABLE
CREATE POLICY "Admin full access to inquiries" ON inquiries
  FOR ALL USING (is_admin_simple());

-- BLOGS TABLE
CREATE POLICY "Admin full access to blogs" ON blogs
  FOR ALL USING (is_admin_simple());

-- PAGES TABLE
CREATE POLICY "Admin full access to pages" ON pages
  FOR ALL USING (is_admin_simple());

-- SETTINGS TABLE
CREATE POLICY "Admin full access to settings" ON settings
  FOR ALL USING (is_admin_simple());

-- Step 6: Verify all policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'properties', 'inquiries', 'blogs', 'pages', 'settings')
ORDER BY tablename, policyname;

-- Step 7: Test the new admin function
SELECT is_admin_simple() as admin_check; 