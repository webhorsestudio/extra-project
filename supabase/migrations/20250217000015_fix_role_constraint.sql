-- Fix the role constraint by dropping and recreating it
-- This ensures the constraint allows 'admin', 'agent', and 'customer' roles

-- First, drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Recreate the constraint with the correct values
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'agent', 'customer')); 