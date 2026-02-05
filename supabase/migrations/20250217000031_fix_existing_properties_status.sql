-- Fix existing properties status and verification
-- This migration ensures that existing properties created before the pending system
-- are properly marked as active and verified

-- Update all existing properties to be active and verified
-- (assuming they were created by admins and should be approved)
UPDATE properties 
SET 
  status = 'active',
  is_verified = true,
  verified_at = created_at
WHERE status IS NULL OR status = '';

-- Add comment to document this migration
COMMENT ON COLUMN properties.status IS 'Current status of the property (active, inactive, sold, rented, under_construction, pending)';
COMMENT ON COLUMN properties.is_verified IS 'Whether the property has been verified by admin (true for existing properties, false for new user submissions)'; 