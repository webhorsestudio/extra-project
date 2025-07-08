-- Add featured_image column to blogs table if it doesn't exist
-- This fixes the "column blogs.featured_image does not exist" error

-- Add the featured_image column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blogs' 
        AND column_name = 'featured_image'
    ) THEN
        ALTER TABLE blogs ADD COLUMN featured_image TEXT;
        RAISE NOTICE 'Added featured_image column to blogs table';
    ELSE
        RAISE NOTICE 'featured_image column already exists in blogs table';
    END IF;
END $$;

-- Add comment to document the column
COMMENT ON COLUMN blogs.featured_image IS 'URL of the featured image for the blog post';

-- Verify the column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'blogs' 
AND column_name = 'featured_image'; 