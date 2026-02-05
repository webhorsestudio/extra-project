-- Targeted fix for profiles table policies based on actual existing policies
-- This addresses the specific issues we found

-- Step 1: Drop the problematic recursive policy first
DROP POLICY IF EXISTS "Allow users to access their own profile" ON profiles;

-- Step 2: Drop duplicate policies (keep only one of each type)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their profile" ON profiles;

-- Step 3: Drop the problematic is_admin function if it exists
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

-- Step 5: Create clean, non-duplicate policies with proper UUID casting

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid()::uuid);

-- Users can update their own profile  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid()::uuid);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid()::uuid);

-- Admins can do everything (using simple function)
CREATE POLICY "Admin full access to profiles" ON profiles
  FOR ALL USING (is_admin_simple());

-- Step 6: Verify the policies
SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 7: Test the admin function
SELECT is_admin_simple() as admin_check; 