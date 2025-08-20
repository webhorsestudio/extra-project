-- Migration to update public_listing_type enum to only have 'public_property'
-- This migration handles the transition from multiple enum values to a single value
-- IMPORTANT: Run this migration in multiple steps due to PostgreSQL enum constraints

-- STEP 1: Add the new enum value to the existing enum
-- Run this first and commit it
ALTER TYPE public_listing_type ADD VALUE 'public_property';

-- STEP 2: After committing STEP 1, run this to update existing records
-- UPDATE public_listings 
-- SET type = 'public_property' 
-- WHERE type IS NOT NULL;

-- Now we can safely remove the old enum values
-- We need to do this carefully since PostgreSQL doesn't allow removing enum values directly
-- So we'll recreate the enum with only the value we want

-- Create a new enum with only 'public_property'
CREATE TYPE public_listing_type_new AS ENUM ('public_property');

-- Add a new column with the new enum type
ALTER TABLE public_listings 
ADD COLUMN type_new public_listing_type_new NOT NULL DEFAULT 'public_property';

-- Copy data from the old type column
UPDATE public_listings 
SET type_new = 'public_property';

-- Drop the old type column
ALTER TABLE public_listings DROP COLUMN type;

-- Rename the new column to the original name
ALTER TABLE public_listings RENAME COLUMN type_new TO type;

-- Recreate the index for the type column
DROP INDEX IF EXISTS public_listings_type_idx;
CREATE INDEX public_listings_type_idx ON public_listings (type);

-- Add a check constraint to ensure only 'public_property' is allowed
ALTER TABLE public_listings 
ADD CONSTRAINT check_public_listing_type 
CHECK (type = 'public_property');

-- Now we can drop the old enum type since it's no longer referenced
DROP TYPE public_listing_type;

-- Rename the new enum to the original name
ALTER TYPE public_listing_type_new RENAME TO public_listing_type;

-- Recreate the trigger (in case it was dropped)
DROP TRIGGER IF EXISTS update_public_listings_updated_at ON public_listings;
CREATE TRIGGER update_public_listings_updated_at
    BEFORE UPDATE ON public_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Re-enable RLS and recreate policies
ALTER TABLE public_listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can do everything on public_listings" ON public_listings;
DROP POLICY IF EXISTS "Public read access to published listings" ON public_listings;

-- Recreate policies for admins (full access)
CREATE POLICY "Admins can do everything on public_listings" ON public_listings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Recreate policy for public read access (published only)
CREATE POLICY "Public read access to published listings" ON public_listings
    FOR SELECT
    TO anon, authenticated
    USING (status = 'published' AND (expire_date IS NULL OR expire_date > NOW()));
