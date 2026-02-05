-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON inquiries;
DROP FUNCTION IF EXISTS update_inquiries_updated_at();

-- Create the corrected trigger function
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiries_updated_at(); 