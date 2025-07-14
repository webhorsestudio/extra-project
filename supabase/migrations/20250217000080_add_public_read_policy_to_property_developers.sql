-- Add public read policy to property_developers table
-- This allows all users (including unauthenticated) to view developer information
-- This is necessary for the "Listing By" section in the single property page

-- Enable RLS on property_developers table if not already enabled
ALTER TABLE property_developers ENABLE ROW LEVEL SECURITY;

-- Add public read policy for property_developers
-- This allows anyone to view developer information for the web layout
CREATE POLICY "Public read access to property_developers" ON property_developers
  FOR SELECT USING (true);

-- Add comment for documentation
COMMENT ON POLICY "Public read access to property_developers" ON property_developers IS 'Allows public access to developer information for web layout display';

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'property_developers'
ORDER BY policyname; 