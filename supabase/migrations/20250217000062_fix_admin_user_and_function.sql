-- Comprehensive fix for admin user and is_admin() function
-- This will ensure the admin user exists and the function works properly

-- Step 1: Drop all policies that depend on is_admin() function first
DROP POLICY IF EXISTS "inquiries_admin_full_access" ON inquiries;
DROP POLICY IF EXISTS "Admin full access to inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to read all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to update all data" ON inquiries;
DROP POLICY IF EXISTS "Admin full access to properties" ON properties;
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admin full access to blogs" ON blogs;
DROP POLICY IF EXISTS "Admin full access to pages" ON pages;
DROP POLICY IF EXISTS "Admin full access to settings" ON settings;

-- Step 2: Now we can safely drop the existing is_admin function
DROP FUNCTION IF EXISTS is_admin();

-- Step 3: Create a robust is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated and has admin role
  RETURN auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid()::uuid 
    AND role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return false on any error
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Step 4: Recreate the admin policies with the new function
CREATE POLICY "inquiries_admin_full_access" ON inquiries
  FOR ALL USING (is_admin());

CREATE POLICY "properties_admin_full_access" ON properties
  FOR ALL USING (is_admin());

CREATE POLICY "profiles_admin_full_access" ON profiles
  FOR ALL USING (is_admin());

CREATE POLICY "blogs_admin_full_access" ON blogs
  FOR ALL USING (is_admin());

CREATE POLICY "pages_admin_full_access" ON pages
  FOR ALL USING (is_admin());

CREATE POLICY "settings_admin_full_access" ON settings
  FOR ALL USING (is_admin());

-- Step 5: Ensure admin user exists
-- First, check if admin@example.com exists in auth.users
DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT := 'admin@example.com';
    admin_password TEXT := 'admin123456';
    admin_name TEXT := 'Admin User';
BEGIN
    -- Check if admin user exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF admin_user_id IS NULL THEN
        -- Create admin user in auth.users
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data
        ) VALUES (
            gen_random_uuid(),
            admin_email,
            crypt(admin_password, gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            jsonb_build_object('full_name', admin_name)
        ) RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Created admin user with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
    END IF;
    
    -- Ensure profile exists with admin role
    INSERT INTO profiles (
        id,
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        admin_name,
        'admin',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        full_name = admin_name,
        updated_at = NOW();
        
    RAISE NOTICE 'Admin profile created/updated successfully';
END $$;

-- Step 6: Verify admin user exists
SELECT 
    u.id,
    u.email,
    p.role,
    p.full_name,
    u.created_at,
    p.updated_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.role = 'admin'
ORDER BY p.created_at DESC;

-- Step 7: Test the is_admin() function
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    is_admin() as admin_check;

-- Step 8: Show all profiles for debugging
SELECT 
    p.id,
    p.full_name,
    p.role,
    u.email,
    p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC; 