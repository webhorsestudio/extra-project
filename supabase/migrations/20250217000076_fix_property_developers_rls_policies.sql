-- Fix property_developers table RLS policies
-- This migration sets up proper RLS for the property_developers table

-- First, enable RLS on property_developers table
ALTER TABLE property_developers ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start clean
DROP POLICY IF EXISTS "Service role can read all property developers" ON property_developers;
DROP POLICY IF EXISTS "Service role can update all property developers" ON property_developers;
DROP POLICY IF EXISTS "Service role can insert property developers" ON property_developers;
DROP POLICY IF EXISTS "Service role can delete property developers" ON property_developers;
DROP POLICY IF EXISTS "Admins can read all property developers" ON property_developers;
DROP POLICY IF EXISTS "Admins can update all property developers" ON property_developers;
DROP POLICY IF EXISTS "Admins can insert property developers" ON property_developers;
DROP POLICY IF EXISTS "Admins can delete property developers" ON property_developers;

-- Create a simple, non-recursive admin check function
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

-- Policy 1: Service role can read all property developers
CREATE POLICY "Service role can read all property developers" ON property_developers
  FOR SELECT USING (auth.role() = 'service_role');

-- Policy 2: Service role can insert property developers
CREATE POLICY "Service role can insert property developers" ON property_developers
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policy 3: Service role can update all property developers
CREATE POLICY "Service role can update all property developers" ON property_developers
  FOR UPDATE USING (auth.role() = 'service_role');

-- Policy 4: Service role can delete property developers
CREATE POLICY "Service role can delete property developers" ON property_developers
  FOR DELETE USING (auth.role() = 'service_role');

-- Policy 5: Admins can read all property developers
CREATE POLICY "Admins can read all property developers" ON property_developers
  FOR SELECT USING (is_admin_simple());

-- Policy 6: Admins can insert property developers
CREATE POLICY "Admins can insert property developers" ON property_developers
  FOR INSERT WITH CHECK (is_admin_simple());

-- Policy 7: Admins can update all property developers
CREATE POLICY "Admins can update all property developers" ON property_developers
  FOR UPDATE USING (is_admin_simple());

-- Policy 8: Admins can delete property developers
CREATE POLICY "Admins can delete property developers" ON property_developers
  FOR DELETE USING (is_admin_simple());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON property_developers TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_simple() TO authenticated;

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'property_developers'
ORDER BY policyname; 