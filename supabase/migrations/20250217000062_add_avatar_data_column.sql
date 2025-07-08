-- Add avatar column to profiles table
-- This will store avatar images as base64 strings directly in the database

-- Add the avatar column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_data TEXT;

-- Add a comment to explain the column
COMMENT ON COLUMN profiles.avatar_data IS 'Stores avatar image as base64 string';

-- Update existing profiles to have empty avatar_data
UPDATE profiles 
SET avatar_data = NULL 
WHERE avatar_data IS NULL; 