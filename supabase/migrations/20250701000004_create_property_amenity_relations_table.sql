-- Create property_amenity_relations table for many-to-many relationship
CREATE TABLE IF NOT EXISTS property_amenity_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES property_amenities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, amenity_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_amenity_relations_property_id ON property_amenity_relations(property_id);
CREATE INDEX IF NOT EXISTS idx_property_amenity_relations_amenity_id ON property_amenity_relations(amenity_id);
CREATE INDEX IF NOT EXISTS idx_property_amenity_relations_created_at ON property_amenity_relations(created_at);

-- Enable Row Level Security
ALTER TABLE property_amenity_relations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read property amenity relations" ON property_amenity_relations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert property amenity relations" ON property_amenity_relations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete property amenity relations" ON property_amenity_relations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Add comments
COMMENT ON TABLE property_amenity_relations IS 'Many-to-many relationship between properties and amenities';
COMMENT ON COLUMN property_amenity_relations.property_id IS 'Reference to the property';
COMMENT ON COLUMN property_amenity_relations.amenity_id IS 'Reference to the amenity';
COMMENT ON COLUMN property_amenity_relations.created_at IS 'Timestamp when the relationship was created'; 