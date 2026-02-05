-- Fix property slug generation to prevent duplicate location names
-- This migration updates the slug generation function and regenerates all slugs

-- Step 1: Update the slug generation function to use only title
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

-- Step 2: Clear all existing slugs to regenerate them
UPDATE properties SET slug = NULL;

-- Step 3: Regenerate all slugs using the updated function
UPDATE properties 
SET slug = generate_property_slug(title, location)
WHERE slug IS NULL;

-- Step 4: Verify the results
-- This will show the first 10 properties with their new slugs
SELECT id, title, location, slug 
FROM properties 
WHERE status = 'active' OR status = 'pending'
ORDER BY created_at DESC
LIMIT 10;
