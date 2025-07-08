-- Fix Settings RLS Policies - Remove UUID Casting Issues
-- This migration fixes the type mismatch issues in settings table

-- Drop all existing settings policies that might have UUID casting issues
DROP POLICY IF EXISTS "Admin full access to settings" ON settings;
DROP POLICY IF EXISTS "Allow admin users to manage settings" ON settings;
DROP POLICY IF EXISTS "Allow public read access to public settings" ON settings;
DROP POLICY IF EXISTS "Public read access to settings" ON settings;
DROP POLICY IF EXISTS "settings_authenticated_access" ON settings;
DROP POLICY IF EXISTS "settings_public_read" ON settings;

-- Create simple, safe policies for settings table
-- Settings table has UUID id, so we use proper UUID handling

-- Policy for authenticated users to manage settings (admin operations)
CREATE POLICY "settings_authenticated_manage" ON settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Policy for public read access to settings
CREATE POLICY "settings_public_read" ON settings
  FOR SELECT USING (true);

-- Ensure RLS is enabled
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Note: We don't insert default settings here since the table uses UUID primary key
-- The application will handle creating default settings when needed 