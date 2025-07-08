-- Add admin-specific RLS policies for better admin panel access

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Allow admins to read all data" ON properties;
DROP POLICY IF EXISTS "Allow admins to update all data" ON properties;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON properties;

DROP POLICY IF EXISTS "Allow admins to read all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to update all data" ON inquiries;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON inquiries;

DROP POLICY IF EXISTS "Allow admins to read all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to update all data" ON profiles;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON profiles;

DROP POLICY IF EXISTS "Allow admins to read all data" ON blogs;
DROP POLICY IF EXISTS "Allow admins to update all data" ON blogs;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON blogs;

DROP POLICY IF EXISTS "Allow admins to read all data" ON pages;
DROP POLICY IF EXISTS "Allow admins to update all data" ON pages;
DROP POLICY IF EXISTS "Allow admins to delete all data" ON pages;

-- Create admin policies for properties
CREATE POLICY "Allow admins to read all data" ON properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to update all data" ON properties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to delete all data" ON properties
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create admin policies for inquiries
CREATE POLICY "Allow admins to read all data" ON inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to update all data" ON inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to delete all data" ON inquiries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create admin policies for profiles
CREATE POLICY "Allow admins to read all data" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to update all data" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to delete all data" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'
    )
  );

-- Create admin policies for blogs
CREATE POLICY "Allow admins to read all data" ON blogs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to update all data" ON blogs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to delete all data" ON blogs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create admin policies for pages
CREATE POLICY "Allow admins to read all data" ON pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to update all data" ON pages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to delete all data" ON pages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  ); 