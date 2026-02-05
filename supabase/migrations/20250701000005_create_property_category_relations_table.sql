-- Create property_category_relations table for many-to-many relationship
CREATE TABLE IF NOT EXISTS property_category_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES property_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, category_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_category_relations_property_id ON property_category_relations(property_id);
CREATE INDEX IF NOT EXISTS idx_property_category_relations_category_id ON property_category_relations(category_id);
CREATE INDEX IF NOT EXISTS idx_property_category_relations_created_at ON property_category_relations(created_at);

-- Enable Row Level Security
ALTER TABLE property_category_relations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read property category relations" ON property_category_relations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert property category relations" ON property_category_relations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete property category relations" ON property_category_relations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Add comments
COMMENT ON TABLE property_category_relations IS 'Many-to-many relationship between properties and categories';
COMMENT ON COLUMN property_category_relations.property_id IS 'Reference to the property';
COMMENT ON COLUMN property_category_relations.category_id IS 'Reference to the category';
COMMENT ON COLUMN property_category_relations.created_at IS 'Timestamp when the relationship was created'; 