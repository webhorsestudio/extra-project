-- Safe RLS setup - minimal security without recursion issues
-- This provides basic protection without the complex admin function

-- Step 1: Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Step 2: Create simple, safe policies

-- PROFILES TABLE - Simple user isolation
CREATE POLICY "profiles_own_data" ON profiles
  FOR ALL USING (id = auth.uid()::uuid);

-- PROPERTIES TABLE - Public read, authenticated write
CREATE POLICY "properties_public_read" ON properties
  FOR SELECT USING (true);

CREATE POLICY "properties_authenticated_write" ON properties
  FOR ALL USING (auth.role() = 'authenticated');

-- INQUIRIES TABLE - Public insert, authenticated read
CREATE POLICY "inquiries_public_insert" ON inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "inquiries_authenticated_read" ON inquiries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "inquiries_authenticated_update" ON inquiries
  FOR UPDATE USING (auth.role() = 'authenticated');

-- BLOGS TABLE - Public read, authenticated write
CREATE POLICY "blogs_public_read" ON blogs
  FOR SELECT USING (true);

CREATE POLICY "blogs_authenticated_write" ON blogs
  FOR ALL USING (auth.role() = 'authenticated');

-- PAGES TABLE - Public read, authenticated write
CREATE POLICY "pages_public_read" ON pages
  FOR SELECT USING (true);

CREATE POLICY "pages_authenticated_write" ON pages
  FOR ALL USING (auth.role() = 'authenticated');

-- SETTINGS TABLE - Authenticated only
CREATE POLICY "settings_authenticated_only" ON settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Step 3: Verify policies
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('profiles', 'properties', 'inquiries', 'blogs', 'pages', 'settings')
ORDER BY tablename, policyname; 