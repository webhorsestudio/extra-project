-- Create footer_settings table
-- This table stores general footer configuration and advanced settings

CREATE TABLE IF NOT EXISTS footer_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- General Configuration
  footer_enabled BOOLEAN DEFAULT true,
  footer_position VARCHAR(20) DEFAULT 'bottom', -- bottom, sticky, fixed
  footer_behavior VARCHAR(20) DEFAULT 'normal', -- normal, auto-hide, always-visible
  footer_width VARCHAR(20) DEFAULT 'full', -- full, contained, custom
  max_width VARCHAR(20) DEFAULT 'max-w-7xl',
  
  -- Display Settings
  show_on_mobile BOOLEAN DEFAULT true,
  show_on_tablet BOOLEAN DEFAULT true,
  show_on_desktop BOOLEAN DEFAULT true,
  mobile_collapsible BOOLEAN DEFAULT false,
  tablet_collapsible BOOLEAN DEFAULT false,
  
  -- Performance & Loading
  lazy_load BOOLEAN DEFAULT false,
  preload_critical BOOLEAN DEFAULT true,
  cache_duration INTEGER DEFAULT 3600, -- seconds
  enable_analytics BOOLEAN DEFAULT true,
  
  -- SEO & Accessibility
  structured_data BOOLEAN DEFAULT true,
  schema_type VARCHAR(50) DEFAULT 'Organization',
  enable_aria_labels BOOLEAN DEFAULT true,
  skip_to_content BOOLEAN DEFAULT true,
  focus_indicators BOOLEAN DEFAULT true,
  
  -- Integration Settings
  google_analytics_id TEXT,
  facebook_pixel_id TEXT,
  hotjar_id TEXT,
  custom_tracking_code TEXT,
  custom_css TEXT,
  custom_js TEXT,
  
  -- Advanced Options
  enable_debug_mode BOOLEAN DEFAULT false,
  enable_console_logs BOOLEAN DEFAULT false,
  enable_performance_monitoring BOOLEAN DEFAULT false,
  backup_settings BOOLEAN DEFAULT true,
  auto_backup_frequency VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, monthly
  
  -- Version Control
  settings_version VARCHAR(20) DEFAULT '1.0.0',
  last_backup_at TIMESTAMP WITH TIME ZONE,
  backup_retention_days INTEGER DEFAULT 30,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_footer_settings_active ON footer_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_footer_settings_created_at ON footer_settings(created_at);

-- Enable RLS
ALTER TABLE footer_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Footer settings is viewable by everyone" ON footer_settings;
DROP POLICY IF EXISTS "Footer settings is insertable by admin" ON footer_settings;
DROP POLICY IF EXISTS "Footer settings is updatable by admin" ON footer_settings;
DROP POLICY IF EXISTS "Footer settings is deletable by admin" ON footer_settings;

-- Create RLS policies
-- Everyone can view active footer settings
CREATE POLICY "Footer settings is viewable by everyone" ON footer_settings
  FOR SELECT USING (is_active = true);

-- Admin can view all footer settings
CREATE POLICY "Admin can view all footer settings" ON footer_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can insert footer settings
CREATE POLICY "Footer settings is insertable by admin" ON footer_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can update footer settings
CREATE POLICY "Footer settings is updatable by admin" ON footer_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete footer settings
CREATE POLICY "Footer settings is deletable by admin" ON footer_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_footer_settings_updated_at 
  BEFORE UPDATE ON footer_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default footer settings
INSERT INTO footer_settings (
  footer_enabled,
  footer_position,
  footer_behavior,
  footer_width,
  max_width,
  show_on_mobile,
  show_on_tablet,
  show_on_desktop,
  mobile_collapsible,
  tablet_collapsible,
  lazy_load,
  preload_critical,
  cache_duration,
  enable_analytics,
  structured_data,
  schema_type,
  enable_aria_labels,
  skip_to_content,
  focus_indicators,
  enable_debug_mode,
  enable_console_logs,
  enable_performance_monitoring,
  backup_settings,
  auto_backup_frequency,
  settings_version,
  backup_retention_days,
  is_active
) VALUES (
  true,
  'bottom',
  'normal',
  'full',
  'max-w-7xl',
  true,
  true,
  true,
  false,
  false,
  false,
  true,
  3600,
  true,
  true,
  'Organization',
  true,
  true,
  true,
  false,
  false,
  false,
  true,
  'weekly',
  '1.0.0',
  30,
  true
) ON CONFLICT DO NOTHING; 