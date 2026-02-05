-- Fix all property slugs to remove duplicate location names
-- This script will update the slug generation function and regenerate all slugs

-- Step 1: Update the slug generation function to use only title
CREATE OR REPLACE FUNCTION generate_property_slug(title TEXT, location TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
    current_id UUID;
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
    -- Get the current property ID if we're updating an existing property
    current_id := COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    WHILE EXISTS (SELECT 1 FROM properties WHERE slug = final_slug AND id != current_id) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create a function to regenerate all slugs
CREATE OR REPLACE FUNCTION regenerate_all_property_slugs()
RETURNS void AS $$
DECLARE
    property_record RECORD;
    new_slug TEXT;
BEGIN
    -- Loop through all properties and regenerate their slugs
    FOR property_record IN 
        SELECT id, title, location FROM properties 
        WHERE status = 'active' OR status = 'pending'
    LOOP
        -- Generate new slug using only the title
        new_slug := generate_property_slug(property_record.title, property_record.location);
        
        -- Update the property with the new slug
        UPDATE properties 
        SET slug = new_slug
        WHERE id = property_record.id;
        
        RAISE NOTICE 'Updated slug for property %: %', property_record.id, new_slug;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Execute the regeneration
SELECT regenerate_all_property_slugs();

-- Step 4: Verify the results
SELECT id, title, location, slug 
FROM properties 
WHERE status = 'active' OR status = 'pending'
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Clean up the temporary function
DROP FUNCTION IF EXISTS regenerate_all_property_slugs();
