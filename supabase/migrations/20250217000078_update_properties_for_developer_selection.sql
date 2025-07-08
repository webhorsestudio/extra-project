-- Update properties table to support developer selection in posted_by field
-- This migration adds developer_id foreign key and updates posted_by to store developer name

-- Add developer_id column to properties table (if not already exists)
DO $$ BEGIN
    ALTER TABLE properties ADD COLUMN developer_id UUID REFERENCES property_developers(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add comment to explain the column
COMMENT ON COLUMN properties.developer_id IS 'Reference to the developer who posted this property';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_properties_developer_id ON properties(developer_id);

-- Update posted_by column comment to reflect new usage
COMMENT ON COLUMN properties.posted_by IS 'Name of the developer or user who posted the property (can be from property_developers table or direct user input)';

-- First, check what data we have
DO $$
DECLARE
    null_count INTEGER;
    empty_count INTEGER;
BEGIN
    -- Count properties with NULL posted_by
    SELECT COUNT(*) INTO null_count FROM properties WHERE posted_by IS NULL;
    
    -- Count properties with empty posted_by
    SELECT COUNT(*) INTO empty_count FROM properties WHERE posted_by = '';
    
    -- Log the counts
    RAISE NOTICE 'Properties with NULL posted_by: %', null_count;
    RAISE NOTICE 'Properties with empty posted_by: %', empty_count;
    
    -- Update NULL values
    IF null_count > 0 THEN
        UPDATE properties 
        SET posted_by = 'Unknown User'
        WHERE posted_by IS NULL;
        RAISE NOTICE 'Updated % properties with NULL posted_by', null_count;
    END IF;
    
    -- Update empty values
    IF empty_count > 0 THEN
        UPDATE properties 
        SET posted_by = 'Unknown User'
        WHERE posted_by = '';
        RAISE NOTICE 'Updated % properties with empty posted_by', empty_count;
    END IF;
END $$;

-- Now add a more flexible check constraint
DO $$ BEGIN
    ALTER TABLE properties ADD CONSTRAINT check_poster_info 
    CHECK (posted_by IS NOT NULL AND posted_by != '');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Constraint check_poster_info already exists';
END $$;

-- Update RLS policies to work with developer_id
-- Drop existing policies that use posted_by for user matching
DROP POLICY IF EXISTS "Users can manage own properties" ON properties;
DROP POLICY IF EXISTS "Admins can manage all properties" ON properties;

-- Create simplified policies that focus on admin access
-- For now, we'll allow all authenticated users to manage properties
-- This can be refined later based on your specific requirements
CREATE POLICY "Authenticated users can manage properties" ON properties
FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON properties TO authenticated;
GRANT ALL ON property_developers TO authenticated; 