-- FINAL ADMIN/USER/PUBLIC RLS CLEANUP MIGRATION
-- This migration removes all duplicate/conflicting policies and sets a single, clear policy per table.
-- It uses the is_admin() function for admin access.

-- BLOGS
DROP POLICY IF EXISTS "Admins can read blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can update blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can delete blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can insert blogs" ON blogs;
DROP POLICY IF EXISTS "Allow admins to read all data" ON blogs;
DROP POLICY IF EXISTS "Allow admins to update all data" ON blogs;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON blogs;
DROP POLICY IF EXISTS "Admin full access to blogs" ON blogs;

CREATE POLICY "Admin full access to blogs" ON blogs
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Public read access to blogs" ON blogs;
CREATE POLICY "Public read access to blogs" ON blogs
  FOR SELECT USING (true);

-- PROFILES
DROP POLICY IF EXISTS "Allow admins to read all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to update all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;

CREATE POLICY "Admin full access to profiles" ON profiles
  FOR ALL USING (is_admin());
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- PROPERTIES
DROP POLICY IF EXISTS "Admins can delete any property" ON properties;
DROP POLICY IF EXISTS "Admins can update their own properties" ON properties;
DROP POLICY IF EXISTS "Admins full access" ON properties;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON properties;
DROP POLICY IF EXISTS "Allow admins to read all data" ON properties;
DROP POLICY IF EXISTS "Allow admins to update all data" ON properties;
DROP POLICY IF EXISTS "Admin full access to properties" ON properties;
DROP POLICY IF EXISTS "Allow users to delete their own properties or admins" ON properties;
DROP POLICY IF EXISTS "Allow users to update their own properties or admins" ON properties;
DROP POLICY IF EXISTS "Users can manage own properties" ON properties;

CREATE POLICY "Admin full access to properties" ON properties
  FOR ALL USING (is_admin());
CREATE POLICY "Users can manage own properties" ON properties
  FOR ALL USING (auth.uid() = posted_by);

-- INQUIRIES
DROP POLICY IF EXISTS "Admins can delete inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can read inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to read all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to update all data" ON inquiries;
DROP POLICY IF EXISTS "Admin full access to inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can view own inquiries" ON inquiries;

CREATE POLICY "Admin full access to inquiries" ON inquiries
  FOR ALL USING (is_admin());
CREATE POLICY "Users can view own inquiries" ON inquiries
  FOR SELECT USING (auth.uid() = user_id);

-- PAGES
DROP POLICY IF EXISTS "Admins can delete pages" ON pages;
DROP POLICY IF EXISTS "Admins can do everything" ON pages;
DROP POLICY IF EXISTS "Admins can insert pages" ON pages;
DROP POLICY IF EXISTS "Admins can read pages" ON pages;
DROP POLICY IF EXISTS "Admins can update pages" ON pages;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON pages;
DROP POLICY IF EXISTS "Allow admins to read all data" ON pages;
DROP POLICY IF EXISTS "Allow admins to update all data" ON pages;
DROP POLICY IF EXISTS "Admin full access to pages" ON pages;

CREATE POLICY "Admin full access to pages" ON pages
  FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Public read access to pages" ON pages;
CREATE POLICY "Public read access to pages" ON pages
  FOR SELECT USING (true);

-- SETTINGS
DROP POLICY IF EXISTS "Allow admin to manage settings" ON settings;
DROP POLICY IF EXISTS "Allow admin users to manage settings" ON settings;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON settings;
DROP POLICY IF EXISTS "Allow admins to read all data" ON settings;
DROP POLICY IF EXISTS "Allow admins to update all data" ON settings;
DROP POLICY IF EXISTS "Admin full access to settings" ON settings;

CREATE POLICY "Admin full access to settings" ON settings
  FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Public read access to settings" ON settings;
CREATE POLICY "Public read access to settings" ON settings
  FOR SELECT USING (true);

-- PROPERTY CONFIGURATIONS
DROP POLICY IF EXISTS "Admins can update configurations" ON property_configurations;
DROP POLICY IF EXISTS "Admin full access to property_configurations" ON property_configurations;
DROP POLICY IF EXISTS "Public read access to property_configurations" ON property_configurations;

CREATE POLICY "Admin full access to property_configurations" ON property_configurations
  FOR ALL USING (is_admin());
CREATE POLICY "Public read access to property_configurations" ON property_configurations
  FOR SELECT USING (true);

-- PROPERTY IMAGES
DROP POLICY IF EXISTS "Admins can delete any property image" ON property_images;
DROP POLICY IF EXISTS "Admin full access to property_images" ON property_images;
DROP POLICY IF EXISTS "Public read access to property_images" ON property_images;

CREATE POLICY "Admin full access to property_images" ON property_images
  FOR ALL USING (is_admin());
CREATE POLICY "Public read access to property_images" ON property_images
  FOR SELECT USING (true);

-- BLOG CATEGORIES
DROP POLICY IF EXISTS "Allow admin users to manage blog_categories" ON blog_categories;
DROP POLICY IF EXISTS "Admin full access to blog_categories" ON blog_categories;
DROP POLICY IF EXISTS "Public read access to blog_categories" ON blog_categories;

CREATE POLICY "Admin full access to blog_categories" ON blog_categories
  FOR ALL USING (is_admin());
CREATE POLICY "Public read access to blog_categories" ON blog_categories
  FOR SELECT USING (true);

-- VERIFY
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