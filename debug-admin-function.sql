-- Debug why is_admin() function is returning false
-- This will help us understand what's happening

-- 1. Check the current user
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- 2. Check if there's a profile for the current user
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  p.created_at,
  p.updated_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.id = auth.uid()::uuid;

-- 3. Check all profiles to see what's in the database
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- 4. Test the is_admin() function step by step
SELECT 
  auth.uid() as user_id,
  auth.uid()::uuid as user_id_uuid,
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid()::uuid 
    AND role = 'admin'
  ) as has_admin_profile,
  (SELECT role FROM profiles WHERE id = auth.uid()::uuid) as user_role;

-- 5. Check if there are any admin users at all
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'agent' THEN 1 END) as agent_count,
  COUNT(CASE WHEN role = 'customer' THEN 1 END) as customer_count
FROM profiles;

-- 6. Show all admin users
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