-- Create or update admin user with password "Krishna@2025"
-- This migration ensures there's an admin user with the specified password

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create or update admin user
CREATE OR REPLACE FUNCTION create_or_update_admin_user(
    admin_email TEXT DEFAULT 'admin@example.com',
    admin_password TEXT DEFAULT 'Krishna@2025',
    admin_name TEXT DEFAULT 'Admin User'
)
RETURNS TEXT AS $$
DECLARE
    admin_user_id UUID;
    existing_user_id UUID;
BEGIN
    -- Check if admin user already exists
    SELECT u.id INTO existing_user_id
    FROM auth.users u
    JOIN profiles p ON u.id = p.id
    WHERE p.role = 'admin'
    LIMIT 1;
    
    -- If admin user exists, update password
    IF existing_user_id IS NOT NULL THEN
        UPDATE auth.users 
        SET encrypted_password = crypt(admin_password, gen_salt('bf'))
        WHERE id = existing_user_id;
        
        -- Also update email if different
        UPDATE auth.users 
        SET email = admin_email
        WHERE id = existing_user_id AND email != admin_email;
        
        -- Update profile name if different
        UPDATE profiles 
        SET full_name = admin_name, updated_at = NOW()
        WHERE id = existing_user_id AND full_name != admin_name;
        
        admin_user_id := existing_user_id;
        RETURN 'Updated existing admin user: ' || admin_email;
    ELSE
        -- Create new admin user
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
        
        -- Create profile for the new admin user
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
        );
        
        RETURN 'Created new admin user: ' || admin_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to create or update admin user
SELECT create_or_update_admin_user();

-- Clean up the function
DROP FUNCTION create_or_update_admin_user(TEXT, TEXT, TEXT);

-- Verify the admin user exists and has correct role
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

-- Test the is_admin() function
SELECT is_admin() as admin_check; 