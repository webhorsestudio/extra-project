-- Add posted_by column to properties table
-- This column will store the name/email of the user who posted the property

-- Add the posted_by column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE properties ADD COLUMN posted_by TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add a comment to explain the column
COMMENT ON COLUMN properties.posted_by IS 'Name or email of the user who posted the property'; 