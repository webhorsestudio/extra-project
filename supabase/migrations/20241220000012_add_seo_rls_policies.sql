-- Add RLS policies for SEO tables (Simplified version without profiles dependency)
-- This migration adds Row Level Security policies to the SEO tables

-- Enable Row Level Security on all SEO tables
ALTER TABLE seo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_monitoring_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keyword_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_test_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access (using service_role for admin access)
-- SEO Events - Service role can manage all, public can insert
CREATE POLICY "Allow service role to manage seo_events" ON seo_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow public to insert seo_events" ON seo_events
  FOR INSERT WITH CHECK (true);

-- SEO Monitoring Data - Service role can manage all
CREATE POLICY "Allow service role to manage seo_monitoring_data" ON seo_monitoring_data
  FOR ALL USING (auth.role() = 'service_role');

-- SEO Reports - Service role can manage all
CREATE POLICY "Allow service role to manage seo_reports" ON seo_reports
  FOR ALL USING (auth.role() = 'service_role');

-- SEO Audit Results - Service role can manage all
CREATE POLICY "Allow service role to manage seo_audit_results" ON seo_audit_results
  FOR ALL USING (auth.role() = 'service_role');

-- SEO Keyword Rankings - Service role can manage all
CREATE POLICY "Allow service role to manage seo_keyword_rankings" ON seo_keyword_rankings
  FOR ALL USING (auth.role() = 'service_role');

-- SEO Alerts - Service role can manage all
CREATE POLICY "Allow service role to manage seo_alerts" ON seo_alerts
  FOR ALL USING (auth.role() = 'service_role');

-- SEO Settings - Service role can manage all, public can read public settings
CREATE POLICY "Allow service role to manage seo_settings" ON seo_settings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow public to read public seo_settings" ON seo_settings
  FOR SELECT USING (is_public = true);

-- SEO Test Results - Service role can manage all
CREATE POLICY "Allow service role to manage seo_test_results" ON seo_test_results
  FOR ALL USING (auth.role() = 'service_role');
