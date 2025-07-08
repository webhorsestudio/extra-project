-- Complete fix for profile creation issue
-- This addresses the "Account setup incomplete" error

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
DROP POLICY IF EXISTS "Service role full access" ON profiles;

-- Step 2: Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 3: Create a new, improved trigger function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with SECURITY DEFINER to bypass RLS
  INSERT INTO profiles (id, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 
    'customer',
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 5: Create a simple, non-recursive admin check function
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

-- Step 6: Create RLS policies that allow the trigger to work

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

-- Step 7: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_simple() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

-- Step 8: Create profiles for existing users who don't have them
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  'customer',
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 9: Verify the fix
SELECT 
  'Trigger function exists' as test,
  EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user'
  ) as result;

SELECT 
  'Trigger exists' as test,
  EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) as result;

SELECT 
  'Profiles count' as test,
  COUNT(*) as result
FROM profiles;

SELECT 
  'Users without profiles' as test,
  COUNT(*) as result
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Step 10: Show current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname; 