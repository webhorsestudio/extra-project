-- Add missing google_analytics_id field to settings table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS google_analytics_id TEXT;

-- Add comment to the column
COMMENT ON COLUMN settings.google_analytics_id IS 'Google Analytics tracking ID (UA-XXXXXXXXX-X or G-XXXXXXXXXX)';

-- Update existing records to have empty string instead of NULL
UPDATE settings 
SET google_analytics_id = '' 
WHERE google_analytics_id IS NULL;

-- Make the column NOT NULL with default empty string
ALTER TABLE settings 
ALTER COLUMN google_analytics_id SET NOT NULL,
ALTER COLUMN google_analytics_id SET DEFAULT '';

-- Note: Constraint will be added in a separate migration after ensuring all data is valid
-- This prevents constraint violation errors during the initial migration
