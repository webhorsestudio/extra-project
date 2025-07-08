-- Update Admin Password Script
-- This script updates the admin user's password to "Krishna@2025"
-- Run this script directly in your Supabase SQL editor

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- First, let's see what admin users exist
SELECT 
    u.id,
    u.email,
    p.role,
    p.full_name,
    u.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.role = 'admin'
ORDER BY p.created_at DESC;

-- Update password for the first admin user found
DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT;
    update_count INTEGER;
BEGIN
    -- Find the first admin user
    SELECT u.id, u.email INTO admin_user_id, admin_email
    FROM auth.users u
    JOIN profiles p ON u.id = p.id
    WHERE p.role = 'admin'
    LIMIT 1;
    
    -- If admin user exists, update the password
    IF admin_user_id IS NOT NULL THEN
        UPDATE auth.users 
        SET encrypted_password = crypt('Krishna@2025', gen_salt('bf'))
        WHERE id = admin_user_id;
        
        GET DIAGNOSTICS update_count = ROW_COUNT;
        
        IF update_count > 0 THEN
            RAISE NOTICE 'Successfully updated password for admin user: % (ID: %)', admin_email, admin_user_id;
        ELSE
            RAISE NOTICE 'No changes made to admin user: % (ID: %)', admin_email, admin_user_id;
        END IF;
    ELSE
        RAISE NOTICE 'No admin user found. Please create an admin user first.';
    END IF;
END $$;

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

-- Test the is_admin() function
SELECT is_admin() as admin_check; 