-- Add excerpt column to blogs table
ALTER TABLE blogs ADD COLUMN excerpt TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN blogs.excerpt IS 'A brief summary or excerpt of the blog post content'; 