-- Allow authenticated users to insert property developers (sellers) only if their email is not already present

-- Enable RLS if not already enabled
ALTER TABLE property_developers ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can insert property developers" ON property_developers;

-- Create policy: allow insert only if email is unique
CREATE POLICY "Authenticated users can insert property developers" ON property_developers
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (
      SELECT COUNT(*) FROM property_developers d
      WHERE d.contact_info->>'email' = NEW.contact_info->>'email'
    ) = 0
  );

-- Optionally, you may want to add a unique index for extra safety (will error if duplicate)
-- CREATE UNIQUE INDEX IF NOT EXISTS unique_seller_email ON property_developers ((contact_info->>'email')); 