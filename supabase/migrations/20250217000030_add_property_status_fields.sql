-- Add status and verification fields to properties table

-- Add status field
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'rented', 'under_construction'));

-- Add verification fields
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_is_verified ON properties(is_verified);

-- Add comments to document the columns
COMMENT ON COLUMN properties.status IS 'Current status of the property';
COMMENT ON COLUMN properties.is_verified IS 'Whether the property has been verified by admin';
COMMENT ON COLUMN properties.verified_at IS 'Timestamp when the property was verified';
COMMENT ON COLUMN properties.verified_by IS 'User ID who verified the property'; 