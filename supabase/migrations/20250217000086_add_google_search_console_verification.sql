-- Add Google Search Console verification field to settings table
-- This migration adds the google_site_verification field for HTML tag verification

-- Add the google_site_verification field
ALTER TABLE public.settings 
ADD COLUMN google_site_verification text null;

-- Add comment to the field
COMMENT ON COLUMN public.settings.google_site_verification IS 'Google Search Console HTML verification meta tag content';

-- Update the existing settings record if it exists (optional)
-- This will add the field to any existing settings record
UPDATE public.settings 
SET google_site_verification = '' 
WHERE google_site_verification IS NULL;
