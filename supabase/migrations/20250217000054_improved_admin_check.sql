-- Improved admin check function that avoids recursion
-- This provides a more robust solution for admin role checking

-- Drop the previous function if it exists
DROP FUNCTION IF EXISTS is_admin();

-- Create an improved admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the user's role using a direct query
  -- This avoids RLS recursion by using a simple query
  SELECT role INTO user_role
  FROM profiles 
  WHERE id = auth.uid();
  
  -- Return true if role is admin
  RETURN user_role = 'admin';
  
EXCEPTION
  -- If there's any error (including RLS issues), return false
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative approach: Create a function that bypasses RLS for admin checking
CREATE OR REPLACE FUNCTION check_admin_role()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Use a query that bypasses RLS for role checking
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
  
EXCEPTION
  -- If there's any error, return false
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION check_admin_role() TO authenticated;

-- Create a simple test function to verify admin status
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN 'unauthenticated';
  END IF;
  
  -- Get the user's role
  SELECT role INTO user_role
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'no_role');
  
EXCEPTION
  -- If there's any error, return error
  WHEN OTHERS THEN
    RETURN 'error';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;

-- Test the functions
SELECT 
  'is_admin()' as function_name,
  is_admin() as result
UNION ALL
SELECT 
  'check_admin_role()' as function_name,
  check_admin_role() as result
UNION ALL
SELECT 
  'get_user_role()' as function_name,
  get_user_role()::text as result; 