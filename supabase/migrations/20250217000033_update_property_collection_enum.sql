-- Update property_collection_enum to include new collection types
-- First, update existing 'General' properties to 'Featured' as default
UPDATE properties 
SET property_collection = 'Featured' 
WHERE property_collection = 'General';

-- Add new enum values to the existing type
ALTER TYPE property_collection_enum ADD VALUE IF NOT EXISTS 'Ready to Move';
ALTER TYPE property_collection_enum ADD VALUE IF NOT EXISTS 'Under Construction';

-- Set default value to 'Featured' instead of 'General'
ALTER TABLE properties 
ALTER COLUMN property_collection SET DEFAULT 'Featured';

-- Add comments
COMMENT ON TYPE property_collection_enum IS 'Property collection categories for organizing listings';
COMMENT ON COLUMN properties.property_collection IS 'Collection category for the property'; 