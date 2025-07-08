-- Fix blogs table column issue
-- Run this in your Supabase SQL Editor

-- Add featured_image_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blogs' 
        AND column_name = 'featured_image_url'
    ) THEN
        ALTER TABLE blogs ADD COLUMN featured_image_url TEXT;
        RAISE NOTICE 'Added featured_image_url column to blogs table';
    ELSE
        RAISE NOTICE 'featured_image_url column already exists in blogs table';
    END IF;
END $$;

-- Add comment
COMMENT ON COLUMN blogs.featured_image_url IS 'URL of the featured image for the blog post';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'blogs' 
AND column_name = 'featured_image_url';

-- Test the query that was failing
SELECT id, title, excerpt, featured_image_url, created_at
FROM blogs
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 3; 