-- Add constraints for SEO fields after ensuring all data is valid
-- This migration should be run after the previous migrations have successfully updated all existing data

-- Add validation check for Google Analytics ID format
ALTER TABLE settings 
ADD CONSTRAINT check_google_analytics_id_format 
CHECK (
  google_analytics_id = '' OR 
  google_analytics_id ~ '^UA-\d{4,10}-\d{1,4}$' OR 
  google_analytics_id ~ '^G-[A-Z0-9]{10}$'
);

-- Add validation check for URL format
ALTER TABLE settings 
ADD CONSTRAINT check_site_url_format 
CHECK (
  site_url = '' OR 
  site_url ~ '^https?://[^\s/$.?#].[^\s]*$'
);

-- Add comments for better documentation
COMMENT ON CONSTRAINT check_google_analytics_id_format ON settings IS 'Ensures Google Analytics ID follows correct format (UA-XXXXXXXXX-X or G-XXXXXXXXXX)';
COMMENT ON CONSTRAINT check_site_url_format ON settings IS 'Ensures site URL follows valid HTTP/HTTPS format';
