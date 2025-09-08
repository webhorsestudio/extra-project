-- Add slug support for SEO-friendly property URLs
-- This migration adds slug generation and management for properties

-- Add slug column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);

-- Add comment
COMMENT ON COLUMN properties.slug IS 'SEO-friendly URL slug for the property';

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_property_slug(title TEXT, location TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Use only the title for slug generation, not title + location
    -- This prevents duplicate location names in the slug
    base_slug := lower(regexp_replace(
        regexp_replace(
            regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        ),
        '-+', '-', 'g'
    ));
    
    -- Remove leading/trailing hyphens
    base_slug := trim(both '-' from base_slug);
    
    -- Limit length to 80 characters to leave room for counter
    base_slug := left(base_slug, 80);
    
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM properties WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to update slug when property is inserted or updated
CREATE OR REPLACE FUNCTION update_property_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update slug if it's null or empty
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_property_slug(NEW.title, NEW.location);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slugs
DROP TRIGGER IF EXISTS trigger_update_property_slug ON properties;
CREATE TRIGGER trigger_update_property_slug
    BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_property_slug();

-- Generate slugs for existing properties
UPDATE properties 
SET slug = generate_property_slug(title, location)
WHERE slug IS NULL OR slug = '';

-- Make slug NOT NULL after populating existing records
ALTER TABLE properties ALTER COLUMN slug SET NOT NULL;
