-- Temporarily disable RLS on SEO tables to fix audit functionality
-- This is a temporary fix to allow the audit API to work properly

-- Disable RLS on seo_audit_results table temporarily
ALTER TABLE seo_audit_results DISABLE ROW LEVEL SECURITY;

-- Disable RLS on seo_reports table temporarily  
ALTER TABLE seo_reports DISABLE ROW LEVEL SECURITY;

-- Disable RLS on seo_monitoring_data table temporarily
ALTER TABLE seo_monitoring_data DISABLE ROW LEVEL SECURITY;

-- Disable RLS on seo_keyword_rankings table temporarily
ALTER TABLE seo_keyword_rankings DISABLE ROW LEVEL SECURITY;

-- Disable RLS on seo_alerts table temporarily
ALTER TABLE seo_alerts DISABLE ROW LEVEL SECURITY;

-- Disable RLS on seo_settings table temporarily
ALTER TABLE seo_settings DISABLE ROW LEVEL SECURITY;

-- Disable RLS on seo_test_results table temporarily
ALTER TABLE seo_test_results DISABLE ROW LEVEL SECURITY;

-- Keep seo_events RLS enabled as it's working fine