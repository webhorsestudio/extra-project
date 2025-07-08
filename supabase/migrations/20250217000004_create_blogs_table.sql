-- Create enum for blog status
CREATE TYPE blog_status AS ENUM ('draft', 'published');

-- Create blog_categories table
CREATE TABLE blog_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create blogs table
CREATE TABLE blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    excerpt TEXT,
    status blog_status NOT NULL DEFAULT 'draft',
    category_id UUID REFERENCES blog_categories(id),
    featured_image TEXT,
    featured_image_storage_path TEXT,
    seo_title TEXT,
    seo_description TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_blog_categories_updated_at
    BEFORE UPDATE ON blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_categories
CREATE POLICY "Anyone can view blog categories"
    ON blog_categories FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage blog categories"
    ON blog_categories FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create policies for blogs
CREATE POLICY "Anyone can view published blogs"
    ON blogs FOR SELECT
    USING (status = 'published');

CREATE POLICY "Admins can manage blogs"
    ON blogs FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create indexes
CREATE INDEX blogs_slug_idx ON blogs (slug);
CREATE INDEX blogs_status_idx ON blogs (status);
CREATE INDEX blogs_category_id_idx ON blogs (category_id);
CREATE INDEX blogs_published_at_idx ON blogs (published_at); 