-- Temporarily disable RLS for property_locations table for testing
-- This will allow all operations without RLS restrictions
ALTER TABLE property_locations DISABLE ROW LEVEL SECURITY;

-- Note: Re-enable RLS later with proper policies when everything is working
-- ALTER TABLE property_locations ENABLE ROW LEVEL SECURITY; 