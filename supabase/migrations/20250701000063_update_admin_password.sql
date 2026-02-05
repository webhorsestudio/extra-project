-- Update admin user password to "Krishna@2025"
-- This migration updates the password for the admin user

-- First, let's check if there's an admin user
DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT;
BEGIN
    -- Find the admin user
    SELECT u.id, u.email INTO admin_user_id, admin_email
    FROM auth.users u
    JOIN profiles p ON u.id = p.id
    WHERE p.role = 'admin'
    LIMIT 1;
    
    -- If admin user exists, update the password
    IF admin_user_id IS NOT NULL THEN
        -- Update the password using Supabase auth.users table
        UPDATE auth.users 
        SET encrypted_password = crypt('Krishna@2025', gen_salt('bf'))
        WHERE id = admin_user_id;
        
        -- Log the update
        RAISE NOTICE 'Updated password for admin user: % (ID: %)', admin_email, admin_user_id;
    ELSE
        RAISE NOTICE 'No admin user found. Please create an admin user first.';
    END IF;
END $$;

-- Alternative approach: If you know the admin email, you can update directly
-- Uncomment the following lines if you know the admin email address
/*
UPDATE auth.users 
SET encrypted_password = crypt('Krishna@2025', gen_salt('bf'))
WHERE email = 'admin@example.com'  -- Replace with actual admin email
  AND id IN (SELECT id FROM profiles WHERE role = 'admin');
*/

-- Verify the admin user still exists and has admin role
SELECT 
    u.id,
    u.email,
    p.role,
    p.full_name,
    u.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.role = 'admin'; 