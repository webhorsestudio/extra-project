-- Fix infinite recursion in admin RLS policies
-- This migration replaces the problematic admin policies with non-recursive alternatives

-- Drop all existing admin policies that cause recursion
DROP POLICY IF EXISTS "Allow admins to read all data" ON properties;
DROP POLICY IF EXISTS "Allow admins to update all data" ON properties;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON properties;

DROP POLICY IF EXISTS "Allow admins to read all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to update all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON inquiries;

DROP POLICY IF EXISTS "Allow admins to read all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to update all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON profiles;

DROP POLICY IF EXISTS "Allow admins to read all data" ON blogs;
DROP POLICY IF EXISTS "Allow admins to update all data" ON blogs;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON blogs;

DROP POLICY IF EXISTS "Allow admins to read all data" ON pages;
DROP POLICY IF EXISTS "Allow admins to update all data" ON pages;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON pages;

-- Create a function to check admin role without recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Use a direct query with bypass RLS to avoid recursion
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
EXCEPTION
  -- If there's any error, return false
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin policies for properties using the function
CREATE POLICY "Allow admins to read all data" ON properties
  FOR SELECT USING (is_admin());

CREATE POLICY "Allow admins to update all data" ON properties
  FOR UPDATE USING (is_admin());

CREATE POLICY "Allow admins to delete all data" ON properties
  FOR DELETE USING (is_admin());

-- Create admin policies for inquiries using the function
CREATE POLICY "Allow admins to read all data" ON inquiries
  FOR SELECT USING (is_admin());

CREATE POLICY "Allow admins to update all data" ON inquiries
  FOR UPDATE USING (is_admin());

CREATE POLICY "Allow admins to delete all data" ON inquiries
  FOR DELETE USING (is_admin());

-- Create admin policies for profiles using the function
CREATE POLICY "Allow admins to read all data" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Allow admins to update all data" ON profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "Allow admins to delete all data" ON profiles
  FOR DELETE USING (is_admin());

-- Create admin policies for blogs using the function
CREATE POLICY "Allow admins to read all data" ON blogs
  FOR SELECT USING (is_admin());

CREATE POLICY "Allow admins to update all data" ON blogs
  FOR UPDATE USING (is_admin());

CREATE POLICY "Allow admins to delete all data" ON blogs
  FOR DELETE USING (is_admin());

-- Create admin policies for pages using the function
CREATE POLICY "Allow admins to read all data" ON pages
  FOR SELECT USING (is_admin());

CREATE POLICY "Allow admins to update all data" ON pages
  FOR UPDATE USING (is_admin());

CREATE POLICY "Allow admins to delete all data" ON pages
  FOR DELETE USING (is_admin());

-- Create admin policies for settings using the function
CREATE POLICY "Allow admins to read all data" ON settings
  FOR SELECT USING (is_admin());

CREATE POLICY "Allow admins to update all data" ON settings
  FOR UPDATE USING (is_admin());

CREATE POLICY "Allow admins to delete all data" ON settings
  FOR DELETE USING (is_admin());

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE policyname LIKE '%admin%' OR policyname LIKE '%Admin%'
ORDER BY tablename, policyname; 