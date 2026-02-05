-- Clean up duplicate and conflicting RLS policies
-- This migration removes all duplicate admin policies and creates clean, non-conflicting ones

-- Drop ALL existing admin policies to start fresh
-- Properties
DROP POLICY IF EXISTS "Admins can delete any property" ON properties;
DROP POLICY IF EXISTS "Admins can update their own properties" ON properties;
DROP POLICY IF EXISTS "Admins full access" ON properties;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON properties;
DROP POLICY IF EXISTS "Allow admins to read all data" ON properties;
DROP POLICY IF EXISTS "Allow admins to update all data" ON properties;
DROP POLICY IF EXISTS "Allow users to delete their own properties or admins" ON properties;
DROP POLICY IF EXISTS "Allow users to update their own properties or admins" ON properties;

-- Inquiries
DROP POLICY IF EXISTS "Admins can delete inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can read inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to read all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to update all data" ON inquiries;

-- Profiles
DROP POLICY IF EXISTS "Allow admins to delete all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to read all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to update all data" ON profiles;

-- Blogs
DROP POLICY IF EXISTS "Admins can delete blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can insert blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can read blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can update blogs" ON blogs;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON blogs;
DROP POLICY IF EXISTS "Allow admins to read all data" ON blogs;
DROP POLICY IF EXISTS "Allow admins to update all data" ON blogs;

-- Pages
DROP POLICY IF EXISTS "Admins can delete pages" ON pages;
DROP POLICY IF EXISTS "Admins can do everything" ON pages;
DROP POLICY IF EXISTS "Admins can insert pages" ON pages;
DROP POLICY IF EXISTS "Admins can read pages" ON pages;
DROP POLICY IF EXISTS "Admins can update pages" ON pages;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON pages;
DROP POLICY IF EXISTS "Allow admins to read all data" ON pages;
DROP POLICY IF EXISTS "Allow admins to update all data" ON pages;

-- Settings
DROP POLICY IF EXISTS "Allow admin to manage settings" ON settings;
DROP POLICY IF EXISTS "Allow admin users to manage settings" ON settings;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON settings;
DROP POLICY IF EXISTS "Allow admins to read all data" ON settings;
DROP POLICY IF EXISTS "Allow admins to update all data" ON settings;

-- Property configurations
DROP POLICY IF EXISTS "Admins can update configurations" ON property_configurations;

-- Property images
DROP POLICY IF EXISTS "Admins can delete any property image" ON property_images;

-- Blog categories
DROP POLICY IF EXISTS "Allow admin users to manage blog_categories" ON blog_categories;

-- Create clean, non-conflicting admin policies using the is_admin() function

-- Properties: Admin full access
CREATE POLICY "Admin full access to properties" ON properties
  FOR ALL USING (is_admin());

-- Inquiries: Admin full access
CREATE POLICY "Admin full access to inquiries" ON inquiries
  FOR ALL USING (is_admin());

-- Profiles: Admin full access
CREATE POLICY "Admin full access to profiles" ON profiles
  FOR ALL USING (is_admin());

-- Blogs: Admin full access
CREATE POLICY "Admin full access to blogs" ON blogs
  FOR ALL USING (is_admin());

-- Pages: Admin full access
CREATE POLICY "Admin full access to pages" ON pages
  FOR ALL USING (is_admin());

-- Settings: Admin full access
CREATE POLICY "Admin full access to settings" ON settings
  FOR ALL USING (is_admin());

-- Property configurations: Admin full access
CREATE POLICY "Admin full access to property_configurations" ON property_configurations
  FOR ALL USING (is_admin());

-- Property images: Admin full access
CREATE POLICY "Admin full access to property_images" ON property_images
  FOR ALL USING (is_admin());

-- Blog categories: Admin full access
CREATE POLICY "Admin full access to blog_categories" ON blog_categories
  FOR ALL USING (is_admin());

-- Create basic user policies (non-admin)

-- Properties: Users can manage their own properties
CREATE POLICY "Users can manage own properties" ON properties
  FOR ALL USING (auth.uid() = posted_by);

-- Inquiries: Users can view their own inquiries
CREATE POLICY "Users can view own inquiries" ON inquiries
  FOR SELECT USING (auth.uid() = user_id);

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Blogs: Public read access
CREATE POLICY "Public read access to blogs" ON blogs
  FOR SELECT USING (true);

-- Pages: Public read access
CREATE POLICY "Public read access to pages" ON pages
  FOR SELECT USING (true);

-- Settings: Public read access to public settings
CREATE POLICY "Public read access to settings" ON settings
  FOR SELECT USING (true);

-- Property configurations: Public read access
CREATE POLICY "Public read access to property_configurations" ON property_configurations
  FOR SELECT USING (true);

-- Property images: Public read access
CREATE POLICY "Public read access to property_images" ON property_images
  FOR SELECT USING (true);

-- Blog categories: Public read access
CREATE POLICY "Public read access to blog_categories" ON blog_categories
  FOR SELECT USING (true);

-- Verify the cleanup
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename IN ('properties', 'inquiries', 'profiles', 'blogs', 'pages', 'settings', 'property_configurations', 'property_images', 'blog_categories')
ORDER BY tablename, policyname; 