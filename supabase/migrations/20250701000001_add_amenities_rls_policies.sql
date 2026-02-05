-- Enable Row Level Security on property_amenities table
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to active amenities
CREATE POLICY "Allow public read on active property_amenities" ON property_amenities
    FOR SELECT USING (is_active = true);

-- Policy: Allow authenticated users to read all amenities (for admin panel)
CREATE POLICY "Allow authenticated users to read all property_amenities" ON property_amenities
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to insert amenities
CREATE POLICY "Allow authenticated users to insert property_amenities" ON property_amenities
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update amenities
CREATE POLICY "Allow authenticated users to update property_amenities" ON property_amenities
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete amenities
CREATE POLICY "Allow authenticated users to delete property_amenities" ON property_amenities
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create index for better performance on is_active column
CREATE INDEX IF NOT EXISTS idx_property_amenities_is_active ON property_amenities(is_active);

-- Create index for better performance on name column (for search)
CREATE INDEX IF NOT EXISTS idx_property_amenities_name ON property_amenities(name); 