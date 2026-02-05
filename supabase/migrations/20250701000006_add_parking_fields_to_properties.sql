-- Add parking fields to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS parking BOOLEAN DEFAULT false;

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS parking_spots INTEGER;

-- Create index for better performance on parking column
CREATE INDEX IF NOT EXISTS idx_properties_parking ON properties(parking);

-- Add comments
COMMENT ON COLUMN properties.parking IS 'Whether the property has parking available';
COMMENT ON COLUMN properties.parking_spots IS 'Number of parking spots available'; 