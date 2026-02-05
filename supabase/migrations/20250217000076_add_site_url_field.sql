-- Add missing site_url field to settings table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS site_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN settings.site_url IS 'Main website URL for sitemap generation';

-- Update existing records to have empty string instead of NULL
UPDATE settings 
SET site_url = '' 
WHERE site_url IS NULL;

-- Make the column NOT NULL with default empty string
ALTER TABLE settings 
ALTER COLUMN site_url SET NOT NULL,
ALTER COLUMN site_url SET DEFAULT '';

-- Note: Constraint will be added in a separate migration after ensuring all data is valid
-- This prevents constraint violation errors during the initial migration
