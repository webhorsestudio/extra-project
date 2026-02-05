-- Fix web layout issues: column names, RLS policies, and public access
-- This migration addresses the errors in the web layout

-- 1. Fix blogs table column reference issue
-- The code is trying to access 'main_image_url' but the column is 'featured_image'
-- Also fix the 'is_published' reference to 'status = published'

-- 2. Fix properties table relationship issue
-- The code is trying to join with 'bhk_configurations' but the table is 'property_configurations'

-- 3. Add missing public read policies for web layout

-- Enable RLS on all tables if not already enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_configurations ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid conflicts
-- Properties table policies
DROP POLICY IF EXISTS "Allow public read-only access to properties" ON properties;
DROP POLICY IF EXISTS "Allow public read access to active properties" ON properties;
DROP POLICY IF EXISTS "Allow authenticated users to manage properties" ON properties;
DROP POLICY IF EXISTS "Allow authenticated users to update properties" ON properties;
DROP POLICY IF EXISTS "Allow authenticated users to insert properties" ON properties;
DROP POLICY IF EXISTS "Allow authenticated users to delete properties" ON properties;

-- Blogs table policies
DROP POLICY IF EXISTS "Allow public read-only access to blogs" ON blogs;
DROP POLICY IF EXISTS "Allow public read access to published blogs" ON blogs;
DROP POLICY IF EXISTS "Allow authenticated users to manage blogs" ON blogs;
DROP POLICY IF EXISTS "Anyone can view published blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can manage blogs" ON blogs;

-- Blog categories table policies
DROP POLICY IF EXISTS "Allow public read-only access to blog_categories" ON blog_categories;
DROP POLICY IF EXISTS "Allow public read access to blog_categories" ON blog_categories;
DROP POLICY IF EXISTS "Allow authenticated users to manage blog_categories" ON blog_categories;
DROP POLICY IF EXISTS "Anyone can view blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Admins can manage blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Allow admin users to manage blog categories" ON blog_categories;

-- Property categories table policies
DROP POLICY IF EXISTS "Allow public read access to property_categories" ON property_categories;
DROP POLICY IF EXISTS "Allow public read access to active property_categories" ON property_categories;
DROP POLICY IF EXISTS "Allow authenticated users to manage property_categories" ON property_categories;
DROP POLICY IF EXISTS "Allow public read on property_categories" ON property_categories;
DROP POLICY IF EXISTS "Allow admin write on property_categories" ON property_categories;

-- Property locations table policies
DROP POLICY IF EXISTS "Allow public read access to property_locations" ON property_locations;
DROP POLICY IF EXISTS "Allow public read access to active property_locations" ON property_locations;
DROP POLICY IF EXISTS "Allow authenticated users to manage property_locations" ON property_locations;
DROP POLICY IF EXISTS "Allow authenticated users to read property locations" ON property_locations;
DROP POLICY IF EXISTS "Allow authenticated users to insert property locations" ON property_locations;
DROP POLICY IF EXISTS "Allow authenticated users to update property locations" ON property_locations;
DROP POLICY IF EXISTS "Allow authenticated users to delete property locations" ON property_locations;

-- Property amenities table policies
DROP POLICY IF EXISTS "Allow public read access to property_amenities" ON property_amenities;
DROP POLICY IF EXISTS "Allow public read access to active property_amenities" ON property_amenities;
DROP POLICY IF EXISTS "Allow authenticated users to manage property_amenities" ON property_amenities;
DROP POLICY IF EXISTS "Allow public read on active property_amenities" ON property_amenities;
DROP POLICY IF EXISTS "Allow authenticated users to read all property_amenities" ON property_amenities;
DROP POLICY IF EXISTS "Allow authenticated users to insert property_amenities" ON property_amenities;
DROP POLICY IF EXISTS "Allow authenticated users to update property_amenities" ON property_amenities;
DROP POLICY IF EXISTS "Allow authenticated users to delete property_amenities" ON property_amenities;

-- Property configurations table policies
DROP POLICY IF EXISTS "Allow public read access to property_configurations" ON property_configurations;
DROP POLICY IF EXISTS "Allow authenticated users to manage property_configurations" ON property_configurations;
DROP POLICY IF EXISTS "Allow authenticated users to select property configurations" ON property_configurations;
DROP POLICY IF EXISTS "Allow authenticated users to insert property configurations" ON property_configurations;
DROP POLICY IF EXISTS "Allow authenticated users to update property configurations" ON property_configurations;
DROP POLICY IF EXISTS "Allow authenticated users to delete property configurations" ON property_configurations;

-- Create comprehensive public read policies for web layout

-- Properties: Allow public read access to active properties
CREATE POLICY "Allow public read access to active properties" ON properties
  FOR SELECT USING (status = 'active' OR status IS NULL);

-- Blogs: Allow public read access to published blogs
CREATE POLICY "Allow public read access to published blogs" ON blogs
  FOR SELECT USING (status = 'published');

-- Blog categories: Allow public read access
CREATE POLICY "Allow public read access to blog_categories" ON blog_categories
  FOR SELECT USING (true);

-- Property categories: Allow public read access to active categories
CREATE POLICY "Allow public read access to active property_categories" ON property_categories
  FOR SELECT USING (is_active = true);

-- Property locations: Allow public read access to active locations
CREATE POLICY "Allow public read access to active property_locations" ON property_locations
  FOR SELECT USING (is_active = true);

-- Property amenities: Allow public read access to active amenities
CREATE POLICY "Allow public read access to active property_amenities" ON property_amenities
  FOR SELECT USING (is_active = true);

-- Property configurations: Allow public read access
CREATE POLICY "Allow public read access to property_configurations" ON property_configurations
  FOR SELECT USING (true);

-- Add authenticated user policies for admin panel access

-- Properties: Allow authenticated users full access
CREATE POLICY "Allow authenticated users to manage properties" ON properties
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Blogs: Allow authenticated users full access
CREATE POLICY "Allow authenticated users to manage blogs" ON blogs
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Blog categories: Allow authenticated users full access
CREATE POLICY "Allow authenticated users to manage blog_categories" ON blog_categories
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Property categories: Allow authenticated users full access
CREATE POLICY "Allow authenticated users to manage property_categories" ON property_categories
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Property locations: Allow authenticated users full access
CREATE POLICY "Allow authenticated users to manage property_locations" ON property_locations
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Property amenities: Allow authenticated users full access
CREATE POLICY "Allow authenticated users to manage property_amenities" ON property_amenities
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Property configurations: Allow authenticated users full access
CREATE POLICY "Allow authenticated users to manage property_configurations" ON property_configurations
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON properties TO authenticated;
GRANT ALL ON blogs TO authenticated;
GRANT ALL ON blog_categories TO authenticated;
GRANT ALL ON property_categories TO authenticated;
GRANT ALL ON property_locations TO authenticated;
GRANT ALL ON property_amenities TO authenticated;
GRANT ALL ON property_configurations TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON POLICY "Allow public read access to active properties" ON properties IS 'Allows public access to active properties for web layout';
COMMENT ON POLICY "Allow public read access to published blogs" ON blogs IS 'Allows public access to published blogs for web layout';
COMMENT ON POLICY "Allow public read access to blog_categories" ON blog_categories IS 'Allows public access to blog categories for web layout';
COMMENT ON POLICY "Allow public read access to active property_categories" ON property_categories IS 'Allows public access to active property categories for web layout';
COMMENT ON POLICY "Allow public read access to active property_locations" ON property_locations IS 'Allows public access to active property locations for web layout';
COMMENT ON POLICY "Allow public read access to active property_amenities" ON property_amenities IS 'Allows public access to active property amenities for web layout';
COMMENT ON POLICY "Allow public read access to property_configurations" ON property_configurations IS 'Allows public access to property configurations for web layout'; 