-- Create property_locations table
CREATE TABLE IF NOT EXISTS property_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  image_storage_path TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_locations_name ON property_locations(name);
CREATE INDEX IF NOT EXISTS idx_property_locations_is_active ON property_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_property_locations_created_at ON property_locations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE property_locations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read property locations" ON property_locations;
DROP POLICY IF EXISTS "Allow authenticated users to insert property locations" ON property_locations;
DROP POLICY IF EXISTS "Allow authenticated users to update property locations" ON property_locations;
DROP POLICY IF EXISTS "Allow authenticated users to delete property locations" ON property_locations;

-- Create more permissive policies for authenticated users
CREATE POLICY "Allow authenticated users to read property locations" ON property_locations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert property locations" ON property_locations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update property locations" ON property_locations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete property locations" ON property_locations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_property_locations_updated_at ON property_locations;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_property_locations_updated_at();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_property_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_property_locations_updated_at
  BEFORE UPDATE ON property_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_property_locations_updated_at();

-- Add comment to table
COMMENT ON TABLE property_locations IS 'Stores property locations with images for the admin panel';
COMMENT ON COLUMN property_locations.name IS 'Name of the location/area';
COMMENT ON COLUMN property_locations.image_url IS 'Public URL of the location image';
COMMENT ON COLUMN property_locations.image_storage_path IS 'Storage path for the uploaded image';
COMMENT ON COLUMN property_locations.description IS 'Optional description of the location';
COMMENT ON COLUMN property_locations.is_active IS 'Whether the location is active and visible'; 