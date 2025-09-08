-- Add missing SEO settings for the admin form
-- This migration adds the settings that are used in the SEO Settings form

INSERT INTO seo_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
-- Basic SEO Settings
('site_name', '', 'string', 'basic', 'Website name for SEO', true),
('site_description', '', 'string', 'basic', 'Website description for SEO', true),
('site_keywords', '', 'string', 'basic', 'Website keywords for SEO', true),
('site_url', '', 'string', 'basic', 'Website URL for SEO', true),

-- Analytics Settings
('google_analytics_id', '', 'string', 'analytics', 'Google Analytics tracking ID', false),
('google_search_console_id', '', 'string', 'analytics', 'Google Search Console property ID', false),
('google_tag_manager_id', '', 'string', 'analytics', 'Google Tag Manager ID', false),

-- Social Media Settings
('facebook_app_id', '', 'string', 'social', 'Facebook App ID for social sharing', false),
('twitter_handle', '', 'string', 'social', 'Twitter handle for social sharing', true),
('linkedin_url', '', 'string', 'social', 'LinkedIn company URL', true),

-- Performance Settings
('enable_resource_hints', 'true', 'boolean', 'performance', 'Enable resource hints (preload, prefetch)', false),
('enable_critical_css', 'true', 'boolean', 'performance', 'Enable critical CSS inlining', false),

-- Advanced Settings
('enable_sitemap', 'true', 'boolean', 'advanced', 'Enable automatic XML sitemap generation', true),
('enable_robots_txt', 'true', 'boolean', 'advanced', 'Enable automatic robots.txt generation', true),
('custom_robots_txt', '', 'string', 'advanced', 'Custom robots.txt content', false)

ON CONFLICT (setting_key) DO NOTHING;

-- Update existing settings descriptions for clarity
UPDATE seo_settings SET description = 'Enable real-time SEO monitoring and data collection' WHERE setting_key = 'enable_seo_monitoring';
UPDATE seo_settings SET description = 'Enable email notifications for SEO issues and alerts' WHERE setting_key = 'enable_seo_alerts';
UPDATE seo_settings SET description = 'Enable automatic structured data validation and generation' WHERE setting_key = 'enable_structured_data_validation';
UPDATE seo_settings SET description = 'Enable automatic meta tags validation and optimization' WHERE setting_key = 'enable_meta_tags_validation';
UPDATE seo_settings SET description = 'Enable Core Web Vitals tracking and monitoring' WHERE setting_key = 'enable_core_web_vitals_tracking';
UPDATE seo_settings SET description = 'Enable SEO analytics tracking and reporting' WHERE setting_key = 'enable_seo_analytics';
