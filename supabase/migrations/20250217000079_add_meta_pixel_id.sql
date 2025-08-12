-- Add meta_pixel_id column to settings table
-- This column stores the Facebook Meta Pixel ID for tracking

ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS meta_pixel_id TEXT DEFAULT '';

-- Update existing rows to have empty string instead of NULL
UPDATE settings 
SET meta_pixel_id = '' 
WHERE meta_pixel_id IS NULL;

-- Make the column NOT NULL after updating existing data
ALTER TABLE settings 
ALTER COLUMN meta_pixel_id SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN settings.meta_pixel_id IS 'Facebook Meta Pixel ID for tracking user interactions and conversions';
