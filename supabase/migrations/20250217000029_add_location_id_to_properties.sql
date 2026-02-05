-- Add location_id column to properties table
-- This creates a foreign key relationship between properties and property_locations

-- Add the location_id column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES property_locations(id) ON DELETE SET NULL;

-- Create index for better performance on location_id queries
CREATE INDEX IF NOT EXISTS idx_properties_location_id ON properties(location_id);

-- Add comment to document the column
COMMENT ON COLUMN properties.location_id IS 'Foreign key reference to property_locations table';

-- Update existing properties to have a default location if needed
-- This is optional and can be commented out if you want to handle existing data differently
-- UPDATE properties SET location_id = (SELECT id FROM property_locations WHERE is_active = true LIMIT 1) WHERE location_id IS NULL; 