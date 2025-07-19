-- Simple Fix for Property Status Constraint
-- This migration directly fixes the constraint violation error

-- Step 1: Drop the existing constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;

-- Step 2: Recreate the constraint with 'pending' included
ALTER TABLE properties 
ADD CONSTRAINT properties_status_check 
CHECK (status IN ('active', 'inactive', 'sold', 'rented', 'under_construction', 'pending'));

-- Step 3: Set default status for new properties to 'pending'
ALTER TABLE properties ALTER COLUMN status SET DEFAULT 'pending';

-- Step 4: Update any existing properties with invalid status
UPDATE properties 
SET status = 'active' 
WHERE status IS NULL OR status = '' OR status NOT IN ('active', 'inactive', 'sold', 'rented', 'under_construction', 'pending');

-- Step 5: Ensure verification fields have proper defaults
ALTER TABLE properties ALTER COLUMN is_verified SET DEFAULT false;

-- Step 6: Update existing properties to be verified (assuming they were created by admins)
UPDATE properties 
SET 
  is_verified = true,
  verified_at = COALESCE(verified_at, created_at)
WHERE is_verified IS NULL OR is_verified = false;

-- Migration completed - the constraint now allows 'pending' status 