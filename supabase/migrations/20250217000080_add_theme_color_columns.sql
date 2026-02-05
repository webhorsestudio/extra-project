-- Add primary_color and secondary_color columns to settings table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#0ea5e9',
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#f8fafc';

-- Update existing records with default values if they don't have these fields
UPDATE settings 
SET 
  primary_color = COALESCE(primary_color, '#0ea5e9'),
  secondary_color = COALESCE(secondary_color, '#f8fafc')
WHERE id IS NOT NULL;

-- Add comments to the columns
COMMENT ON COLUMN settings.primary_color IS 'Primary brand color for buttons and links';
COMMENT ON COLUMN settings.secondary_color IS 'Secondary color for backgrounds and surfaces'; 