-- FIX RLS UUID CASTING ISSUES
-- Run this in your Supabase SQL editor

-- 1. Fix the is_admin() function with proper UUID casting
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

-- 2. Drop all problematic policies
DROP POLICY IF EXISTS "Allow admins to read all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to update all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;

-- 3. Create correct policies for profiles (UUID casting needed)
CREATE POLICY "Admin full access to profiles" ON profiles
  FOR ALL USING (is_admin());
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid()::uuid = id);

-- 4. Drop problematic property policies
DROP POLICY IF EXISTS "Admin full access to properties" ON properties;
DROP POLICY IF EXISTS "Users can manage own properties" ON properties;

-- 5. Create correct policies for properties (NO UUID casting - posted_by is TEXT)
CREATE POLICY "Admin full access to properties" ON properties
  FOR ALL USING (is_admin());
CREATE POLICY "Users can manage own properties" ON properties
  FOR ALL USING (auth.uid() = posted_by);

-- 6. Drop problematic inquiry policies (no user_id column exists)
DROP POLICY IF EXISTS "Admin full access to inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can view own inquiries" ON inquiries;

-- 7. Create correct policies for inquiries (admin only, no user-specific access)
CREATE POLICY "Admin full access to inquiries" ON inquiries
  FOR ALL USING (is_admin());

-- 8. Test the function
SELECT is_admin() as admin_check; 