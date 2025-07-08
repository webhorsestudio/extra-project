-- Add SEO-related columns to settings table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS google_tag_manager_id TEXT,
ADD COLUMN IF NOT EXISTS robots_txt TEXT,
ADD COLUMN IF NOT EXISTS sitemap_schedule TEXT DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS sitemap_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sitemap_include_properties BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sitemap_include_users BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sitemap_include_blog BOOLEAN DEFAULT true;

-- Add comments to the columns
COMMENT ON COLUMN settings.google_tag_manager_id IS 'Google Tag Manager container ID for tracking';
COMMENT ON COLUMN settings.robots_txt IS 'Content of the robots.txt file';
COMMENT ON COLUMN settings.sitemap_schedule IS 'Schedule for sitemap generation (hourly, daily, weekly, monthly)';
COMMENT ON COLUMN settings.sitemap_enabled IS 'Whether sitemap generation is enabled';
COMMENT ON COLUMN settings.sitemap_include_properties IS 'Whether to include properties in sitemap';
COMMENT ON COLUMN settings.sitemap_include_users IS 'Whether to include users in sitemap';
COMMENT ON COLUMN settings.sitemap_include_blog IS 'Whether to include blog posts in sitemap'; 