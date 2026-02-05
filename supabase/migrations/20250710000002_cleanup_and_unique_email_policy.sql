-- Enable RLS if not already enabled
ALTER TABLE property_developers ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can insert property developers" ON property_developers;

-- Clean up: Delete rows with missing or empty email
DELETE FROM property_developers
WHERE contact_info->>'email' IS NULL OR contact_info->>'email' = '';

-- Add a unique index to enforce one seller per email
CREATE UNIQUE INDEX IF NOT EXISTS unique_seller_email ON property_developers ((contact_info->>'email'));

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert property developers" ON property_developers
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated'); 