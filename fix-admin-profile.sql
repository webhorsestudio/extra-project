-- Fix Admin Profile Setup
-- This script ensures the admin user has the correct profile with admin role

-- 1. First, let's see what admin users exist
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin'
ORDER BY p.created_at DESC;

-- 2. Check if the admin@example.com user exists in auth.users
SELECT 
  id,
  email,
  role,
  created_at
FROM auth.users 
WHERE email = 'admin@example.com';

-- 3. If the admin user exists in auth but not in profiles, create the profile
-- (This is a safety check - you can run this if needed)
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin'),
  'admin',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admin@example.com'
  AND id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- 4. Update existing admin user to ensure correct role
UPDATE profiles 
SET 
  role = 'admin',
  full_name = COALESCE(full_name, 'Admin'),
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);

-- 5. Verify the admin user now has admin role
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  p.created_at,
  p.updated_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@example.com';

-- 6. Test the is_admin() function again
SELECT is_admin() as admin_check;

-- 7. Show all profiles with their roles
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC; 