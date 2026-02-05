-- Add new footer text fields for main title and subtitle
-- This migration adds fields for the footer's main text content

ALTER TABLE footer_content 
ADD COLUMN IF NOT EXISTS footer_main_title TEXT DEFAULT 'Searching for your Dream Home?',
ADD COLUMN IF NOT EXISTS footer_main_subtitle TEXT DEFAULT 'GET IN TOUCH WITH OUR EXPERT TEAM TODAY';

-- Add comments for the new columns
COMMENT ON COLUMN footer_content.footer_main_title IS 'Main title text displayed in the footer (e.g., "Searching for your Dream Home?")';
COMMENT ON COLUMN footer_content.footer_main_subtitle IS 'Subtitle text displayed above the main title in the footer (e.g., "GET IN TOUCH WITH OUR EXPERT TEAM TODAY")';

-- Update existing records with default values
UPDATE footer_content 
SET 
  footer_main_title = COALESCE(footer_main_title, 'Searching for your Dream Home?'),
  footer_main_subtitle = COALESCE(footer_main_subtitle, 'GET IN TOUCH WITH OUR EXPERT TEAM TODAY')
WHERE footer_main_title IS NULL OR footer_main_subtitle IS NULL; 