-- Create blog_category_relations table for many-to-many relationship
CREATE TABLE IF NOT EXISTS blog_category_relations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blog_id, category_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_category_relations_blog_id ON blog_category_relations(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_category_relations_category_id ON blog_category_relations(category_id);

-- Enable RLS
ALTER TABLE blog_category_relations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blog_category_relations
CREATE POLICY "Allow public read access to blog category relations" ON blog_category_relations
  FOR SELECT USING (true);

CREATE POLICY "Allow admin users to manage blog category relations" ON blog_category_relations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add some sample blog-category relationships for existing blogs
-- This will associate existing blogs with categories
INSERT INTO blog_category_relations (blog_id, category_id)
SELECT 
  b.id as blog_id,
  bc.id as category_id
FROM blogs b
CROSS JOIN blog_categories bc
WHERE bc.name = 'Technology'  -- Default category for existing blogs
  AND b.status = 'published'
ON CONFLICT (blog_id, category_id) DO NOTHING;

-- Create a view for easier querying of blogs with categories
CREATE OR REPLACE VIEW blogs_with_categories AS
SELECT 
  b.id,
  b.title,
  b.excerpt,
  b.content,
  b.featured_image,
  b.created_at,
  b.status,
  b.updated_at,
  ARRAY_AGG(
    json_build_object(
      'id', bc.id,
      'name', bc.name,
      'slug', bc.slug
    )
  ) FILTER (WHERE bc.id IS NOT NULL) as categories
FROM blogs b
LEFT JOIN blog_category_relations bcr ON b.id = bcr.blog_id
LEFT JOIN blog_categories bc ON bcr.category_id = bc.id
GROUP BY b.id, b.title, b.excerpt, b.content, b.featured_image, b.created_at, b.status, b.updated_at;

-- Grant access to the view
GRANT SELECT ON blogs_with_categories TO authenticated;
GRANT SELECT ON blogs_with_categories TO anon; 