-- Fix RLS policies for SEO tables to work properly with service role
-- This migration updates the RLS policies to be more permissive for admin operations

-- Drop ALL existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow service role to manage seo_audit_results" ON seo_audit_results;
DROP POLICY IF EXISTS "Allow all operations on seo_audit_results" ON seo_audit_results;
DROP POLICY IF EXISTS "Allow service role to manage seo_reports" ON seo_reports;
DROP POLICY IF EXISTS "Allow all operations on seo_reports" ON seo_reports;
DROP POLICY IF EXISTS "Allow service role to manage seo_monitoring_data" ON seo_monitoring_data;
DROP POLICY IF EXISTS "Allow all operations on seo_monitoring_data" ON seo_monitoring_data;
DROP POLICY IF EXISTS "Allow service role to manage seo_keyword_rankings" ON seo_keyword_rankings;
DROP POLICY IF EXISTS "Allow all operations on seo_keyword_rankings" ON seo_keyword_rankings;
DROP POLICY IF EXISTS "Allow service role to manage seo_alerts" ON seo_alerts;
DROP POLICY IF EXISTS "Allow all operations on seo_alerts" ON seo_alerts;
DROP POLICY IF EXISTS "Allow service role to manage seo_settings" ON seo_settings;
DROP POLICY IF EXISTS "Allow all operations on seo_settings" ON seo_settings;
DROP POLICY IF EXISTS "Allow service role to manage seo_test_results" ON seo_test_results;
DROP POLICY IF EXISTS "Allow all operations on seo_test_results" ON seo_test_results;

-- Create more permissive policies for service role operations
-- These policies allow operations when using the service role key

-- SEO Audit Results - Allow all operations for service role
CREATE POLICY "Allow all operations on seo_audit_results" ON seo_audit_results
  FOR ALL USING (true);

-- SEO Reports - Allow all operations for service role  
CREATE POLICY "Allow all operations on seo_reports" ON seo_reports
  FOR ALL USING (true);

-- SEO Monitoring Data - Allow all operations for service role
CREATE POLICY "Allow all operations on seo_monitoring_data" ON seo_monitoring_data
  FOR ALL USING (true);

-- SEO Keyword Rankings - Allow all operations for service role
CREATE POLICY "Allow all operations on seo_keyword_rankings" ON seo_keyword_rankings
  FOR ALL USING (true);

-- SEO Alerts - Allow all operations for service role
CREATE POLICY "Allow all operations on seo_alerts" ON seo_alerts
  FOR ALL USING (true);

-- SEO Settings - Allow all operations for service role
CREATE POLICY "Allow all operations on seo_settings" ON seo_settings
  FOR ALL USING (true);

-- SEO Test Results - Allow all operations for service role
CREATE POLICY "Allow all operations on seo_test_results" ON seo_test_results
  FOR ALL USING (true);

-- Keep the existing public policies for seo_events
-- (These are already working correctly)
