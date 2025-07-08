-- Enable Row Level Security on property_configurations table
ALTER TABLE property_configurations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to select property configurations" ON property_configurations;
DROP POLICY IF EXISTS "Allow authenticated users to insert property configurations" ON property_configurations;
DROP POLICY IF EXISTS "Allow authenticated users to update property configurations" ON property_configurations;
DROP POLICY IF EXISTS "Allow authenticated users to delete property configurations" ON property_configurations;

-- Allow authenticated users to select property configurations
CREATE POLICY "Allow authenticated users to select property configurations"
ON property_configurations FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert property configurations
CREATE POLICY "Allow authenticated users to insert property configurations"
ON property_configurations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update property configurations
CREATE POLICY "Allow authenticated users to update property configurations"
ON property_configurations FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete property configurations
CREATE POLICY "Allow authenticated users to delete property configurations"
ON property_configurations FOR DELETE
USING (auth.role() = 'authenticated');

-- Add comments
COMMENT ON POLICY "Allow authenticated users to select property configurations" ON property_configurations IS 'Allows authenticated users to view property configurations';
COMMENT ON POLICY "Allow authenticated users to insert property configurations" ON property_configurations IS 'Allows authenticated users to create property configurations';
COMMENT ON POLICY "Allow authenticated users to update property configurations" ON property_configurations IS 'Allows authenticated users to update property configurations';
COMMENT ON POLICY "Allow authenticated users to delete property configurations" ON property_configurations IS 'Allows authenticated users to delete property configurations'; 