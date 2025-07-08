-- Add featured_image column if it doesn't exist
ALTER TABLE blogs ADD COLUMN featured_image TEXT;

RAISE NOTICE 'Added featured_image column to blogs table';

RAISE NOTICE 'featured_image column already exists in blogs table';

COMMENT ON COLUMN blogs.featured_image IS 'URL of the featured image for the blog post';

SELECT id, title, excerpt, featured_image, created_at 