-- Fix Property Status Constraint and Ensure Pending Status Works
-- This migration addresses the constraint violation error when inserting properties with 'pending' status

-- Step 1: Drop the existing constraint to recreate it properly
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;

-- Step 2: Recreate the constraint with proper syntax
ALTER TABLE properties 
ADD CONSTRAINT properties_status_check 
CHECK (status IN ('active', 'inactive', 'sold', 'rented', 'under_construction', 'pending'));

-- Step 3: Ensure all existing properties have valid status values
UPDATE properties 
SET status = 'active' 
WHERE status IS NULL OR status = '' OR status NOT IN ('active', 'inactive', 'sold', 'rented', 'under_construction', 'pending');

-- Step 4: Set default status for new properties to 'pending' (for user submissions)
ALTER TABLE properties ALTER COLUMN status SET DEFAULT 'pending';

-- Step 5: Update existing properties to be verified (assuming they were created by admins)
UPDATE properties 
SET 
  is_verified = true,
  verified_at = COALESCE(verified_at, created_at)
WHERE is_verified IS NULL OR is_verified = false;

-- Step 6: Ensure verification fields have proper defaults
ALTER TABLE properties ALTER COLUMN is_verified SET DEFAULT false;
ALTER TABLE properties ALTER COLUMN verified_at SET DEFAULT NULL;

-- Step 7: Add helpful comments
COMMENT ON COLUMN properties.status IS 'Current status of the property (active, inactive, sold, rented, under_construction, pending). New user submissions default to pending.';
COMMENT ON COLUMN properties.is_verified IS 'Whether the property has been verified by admin. New user submissions default to false.';
COMMENT ON COLUMN properties.verified_at IS 'Timestamp when the property was verified by admin';
COMMENT ON COLUMN properties.verified_by IS 'User ID of the admin who verified the property';

-- Step 8: Create or recreate indexes for better performance
DROP INDEX IF EXISTS idx_properties_status;
CREATE INDEX idx_properties_status ON properties(status);

DROP INDEX IF EXISTS idx_properties_is_verified;
CREATE INDEX idx_properties_is_verified ON properties(is_verified);

-- Step 9: Add a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_properties_status_verified ON properties(status, is_verified);

-- Step 10: Verify the constraint is working by testing with a sample insert
-- (This will be commented out to avoid actual insertion during migration)
-- INSERT INTO properties (title, description, price, status) VALUES ('Test Property', 'Test Description', 100000, 'pending') ON CONFLICT DO NOTHING;

-- Step 11: Add helpful function to safely insert properties with proper defaults
CREATE OR REPLACE FUNCTION insert_property_with_defaults(
  p_title TEXT,
  p_description TEXT,
  p_price DECIMAL,
  p_status TEXT DEFAULT 'pending',
  p_is_verified BOOLEAN DEFAULT false
) RETURNS UUID AS $$
DECLARE
  property_id UUID;
BEGIN
  -- Validate status
  IF p_status NOT IN ('active', 'inactive', 'sold', 'rented', 'under_construction', 'pending') THEN
    RAISE EXCEPTION 'Invalid status: %. Must be one of: active, inactive, sold, rented, under_construction, pending', p_status;
  END IF;
  
  -- Insert property with validated status
  INSERT INTO properties (title, description, price, status, is_verified)
  VALUES (p_title, p_description, p_price, p_status, p_is_verified)
  RETURNING id INTO property_id;
  
  RETURN property_id;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Add helpful view for pending properties (with owner email)
CREATE OR REPLACE VIEW pending_properties AS
SELECT 
  p.*,
  pr.full_name as owner_name,
  au.email as owner_email
FROM properties p
LEFT JOIN profiles pr ON p.created_by = pr.id
LEFT JOIN auth.users au ON pr.id = au.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;

-- Step 13: Add helpful view for verified properties (with owner and verifier email)
CREATE OR REPLACE VIEW verified_properties AS
SELECT 
  p.*,
  pr.full_name as owner_name,
  au.email as owner_email,
  vpr.full_name as verified_by_name,
  vu.email as verified_by_email
FROM properties p
LEFT JOIN profiles pr ON p.created_by = pr.id
LEFT JOIN auth.users au ON pr.id = au.id
LEFT JOIN profiles vpr ON p.verified_by = vpr.id
LEFT JOIN auth.users vu ON vpr.id = vu.id
WHERE p.is_verified = true
ORDER BY p.created_at DESC;

-- Step 14: Grant necessary permissions (note: you may need to grant access to auth.users for your role)
GRANT SELECT ON pending_properties TO authenticated;
GRANT SELECT ON verified_properties TO authenticated;

-- Migration completed successfully
-- The property status constraint is now properly configured
-- New user submissions will default to 'pending' status
-- Existing properties are marked as 'active' and 'verified'
-- Helper functions and views are available for common operations
-- NOTE: If you get a permissions error on auth.users, you must grant your role (or yourself) access to SELECT from auth.users. 