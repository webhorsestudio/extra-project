-- Add google_tag_manager_id column to settings table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS google_tag_manager_id TEXT;
 
-- Add comment to the column
COMMENT ON COLUMN settings.google_tag_manager_id IS 'Google Tag Manager ID for analytics tracking'; 