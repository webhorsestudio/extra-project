-- Fix RLS policies for blog_categories table
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow admin users to manage blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Anyone can view blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Admins can manage blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Allow public read-only access to blog_categories" ON blog_categories;

-- Create new comprehensive policies
-- Allow public read access
CREATE POLICY "Allow public read access to blog_categories" ON blog_categories
  FOR SELECT USING (true);

-- Allow admin users to perform all operations
CREATE POLICY "Allow admin users to manage blog_categories" ON blog_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT ALL ON blog_categories TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
