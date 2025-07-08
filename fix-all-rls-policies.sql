-- Comprehensive fix for all RLS policies with infinite recursion
-- This will fix the issue across all tables

-- Step 1: Drop ALL policies that depend on is_admin() function
-- Properties table
DROP POLICY IF EXISTS "Allow admins to read all data" ON properties;
DROP POLICY IF EXISTS "Allow admins to update all data" ON properties;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON properties;

-- Inquiries table
DROP POLICY IF EXISTS "Allow admins to read all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to update all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON inquiries;

-- Blogs table
DROP POLICY IF EXISTS "Allow admins to read all data" ON blogs;
DROP POLICY IF EXISTS "Allow admins to update all data" ON blogs;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON blogs;

-- Pages table
DROP POLICY IF EXISTS "Allow admins to read all data" ON pages;
DROP POLICY IF EXISTS "Allow admins to update all data" ON pages;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON pages;

-- Settings table
DROP POLICY IF EXISTS "Allow admins to read all data" ON settings;
DROP POLICY IF EXISTS "Allow admins to update all data" ON settings;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON settings;

-- Profiles table (all policies)
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

-- Step 4: Recreate all policies with the new function

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid()::uuid);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid()::uuid);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid()::uuid);

CREATE POLICY "Admin full access to profiles" ON profiles
  FOR ALL USING (is_admin_simple());

-- PROPERTIES POLICIES
CREATE POLICY "Public read access to properties" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert properties" ON properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own properties" ON properties
  FOR UPDATE USING (created_by = auth.uid()::text);

CREATE POLICY "Users can delete own properties" ON properties
  FOR DELETE USING (created_by = auth.uid()::text);

CREATE POLICY "Admin full access to properties" ON properties
  FOR ALL USING (is_admin_simple());

-- INQUIRIES POLICIES
CREATE POLICY "Public can insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read inquiries" ON inquiries
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to inquiries" ON inquiries
  FOR ALL USING (is_admin_simple());

CREATE POLICY "Authenticated users can update inquiries" ON inquiries
  FOR UPDATE USING (auth.role() = 'authenticated');

-- BLOGS POLICIES
CREATE POLICY "Public read access to blogs" ON blogs
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to blogs" ON blogs
  FOR ALL USING (is_admin_simple());

CREATE POLICY "Authenticated users can manage blogs" ON blogs
  FOR ALL USING (auth.role() = 'authenticated');

-- PAGES POLICIES
CREATE POLICY "Public read access to pages" ON pages
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to pages" ON pages
  FOR ALL USING (is_admin_simple());

-- SETTINGS POLICIES
CREATE POLICY "Admin full access to settings" ON settings
  FOR ALL USING (is_admin_simple());

-- Step 5: Verify all policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'properties', 'inquiries', 'blogs', 'pages', 'settings')
ORDER BY tablename, policyname;

-- Step 6: Test the new admin function
SELECT is_admin_simple() as admin_check; 