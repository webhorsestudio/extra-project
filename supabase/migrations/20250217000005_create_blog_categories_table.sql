-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_categories_updated_at 
  BEFORE UPDATE ON blog_categories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow admin users to manage blog categories" ON blog_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Insert some default categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Technology', 'technology', 'Technology related posts'),
  ('Business', 'business', 'Business and entrepreneurship posts'),
  ('Lifestyle', 'lifestyle', 'Lifestyle and personal development posts'),
  ('News', 'news', 'News and current events posts')
ON CONFLICT (slug) DO NOTHING; 