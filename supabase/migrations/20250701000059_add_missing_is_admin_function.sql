-- Add missing is_admin() function
-- This function is required by the RLS policies but was missing from the database

-- Create the is_admin() function with proper UUID casting
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()::uuid
    AND role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Verify the function was created
SELECT 
  proname as function_name,
  proargtypes as argument_types,
  prorettype as return_type
FROM pg_proc 
WHERE proname = 'is_admin';

-- Test the function (this will return the result for the current user)
SELECT is_admin() as admin_check; 