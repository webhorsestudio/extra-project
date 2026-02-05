-- Fix public access to relationship tables for web layout
-- This migration adds public read policies to property_amenity_relations and property_category_relations

-- Enable RLS on relationship tables if not already enabled
ALTER TABLE property_amenity_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_category_relations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read property amenity relations" ON property_amenity_relations;
DROP POLICY IF EXISTS "Allow authenticated users to insert property amenity relations" ON property_amenity_relations;
DROP POLICY IF EXISTS "Allow authenticated users to delete property amenity relations" ON property_amenity_relations;

DROP POLICY IF EXISTS "Allow authenticated users to read property category relations" ON property_category_relations;
DROP POLICY IF EXISTS "Allow authenticated users to insert property category relations" ON property_category_relations;
DROP POLICY IF EXISTS "Allow authenticated users to delete property category relations" ON property_category_relations;

-- Create public read policies for property_amenity_relations
CREATE POLICY "Public read access to property amenity relations" ON property_amenity_relations
  FOR SELECT USING (true);

-- Create authenticated user policies for property_amenity_relations
CREATE POLICY "Authenticated users can insert property amenity relations" ON property_amenity_relations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete property amenity relations" ON property_amenity_relations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create public read policies for property_category_relations
CREATE POLICY "Public read access to property category relations" ON property_category_relations
  FOR SELECT USING (true);

-- Create authenticated user policies for property_category_relations
CREATE POLICY "Authenticated users can insert property category relations" ON property_category_relations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete property category relations" ON property_category_relations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON POLICY "Public read access to property amenity relations" ON property_amenity_relations IS 'Allows public access to property amenity relationships for web layout';
COMMENT ON POLICY "Public read access to property category relations" ON property_category_relations IS 'Allows public access to property category relationships for web layout';

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('property_amenity_relations', 'property_category_relations')
ORDER BY tablename, policyname; 