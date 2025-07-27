-- Remove automatic profile creation trigger and function
-- This allows profiles to be created only on first login, not during signup

-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS handle_new_user();

-- Add a policy to allow users to insert their own profile (for first-time login)
-- Only create if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$; 