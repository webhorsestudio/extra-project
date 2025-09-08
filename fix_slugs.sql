-- Fix existing property slugs to remove duplicate location names
-- This script updates the slug generation function and regenerates all slugs

-- Update the slug generation function to use only title
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
    WHILE EXISTS (SELECT 1 FROM properties WHERE slug = final_slug AND id != COALESCE((SELECT id FROM properties WHERE slug = final_slug LIMIT 1), '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Clear all existing slugs to regenerate them
UPDATE properties SET slug = NULL;

-- Regenerate all slugs using the updated function
UPDATE properties 
SET slug = generate_property_slug(title, location)
WHERE slug IS NULL;
