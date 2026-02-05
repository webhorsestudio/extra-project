-- Create FAQ categories table
CREATE TABLE IF NOT EXISTS faq_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id UUID REFERENCES faq_categories(id) ON DELETE SET NULL,
  category_slug TEXT NOT NULL DEFAULT 'general',
  order_index INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faqs_category_id ON faqs(category_id);
CREATE INDEX IF NOT EXISTS idx_faqs_category_slug ON faqs(category_slug);
CREATE INDEX IF NOT EXISTS idx_faqs_order_index ON faqs(order_index);
CREATE INDEX IF NOT EXISTS idx_faqs_is_published ON faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_created_at ON faqs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faq_categories_slug ON faq_categories(slug);

-- Enable Row Level Security
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Create policies for faq_categories table
-- Admins can perform all operations
CREATE POLICY "Admins can manage FAQ categories" ON faq_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- All authenticated users can read categories
CREATE POLICY "Users can read FAQ categories" ON faq_categories
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- Create policies for faqs table
-- Admins can perform all operations
CREATE POLICY "Admins can manage FAQs" ON faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- All authenticated users can read published FAQs
CREATE POLICY "Users can read published FAQs" ON faqs
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND is_published = true
  );

-- Create trigger to update updated_at timestamp for faq_categories
CREATE OR REPLACE FUNCTION update_faq_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_faq_categories_updated_at
  BEFORE UPDATE ON faq_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_faq_categories_updated_at();

-- Create trigger to update updated_at timestamp for faqs
CREATE OR REPLACE FUNCTION update_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_faqs_updated_at();

-- Create function to get FAQs with category information
CREATE OR REPLACE FUNCTION get_faqs_with_categories(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_category_slug TEXT DEFAULT NULL,
  p_is_published BOOLEAN DEFAULT NULL,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  question TEXT,
  answer TEXT,
  category_id UUID,
  category_slug TEXT,
  category_name TEXT,
  order_index INTEGER,
  is_published BOOLEAN,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  creator_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.question,
    f.answer,
    f.category_id,
    f.category_slug,
    fc.name as category_name,
    f.order_index,
    f.is_published,
    f.created_by,
    f.created_at,
    f.updated_at,
    p.full_name as creator_name
  FROM faqs f
  LEFT JOIN faq_categories fc ON f.category_id = fc.id
  LEFT JOIN profiles p ON f.created_by = p.id
  WHERE (p_category_slug IS NULL OR f.category_slug = p_category_slug)
    AND (p_is_published IS NULL OR f.is_published = p_is_published)
    AND (p_search IS NULL OR 
         f.question ILIKE '%' || p_search || '%' OR 
         f.answer ILIKE '%' || p_search || '%')
  ORDER BY f.order_index ASC, f.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get FAQ categories with FAQ count
CREATE OR REPLACE FUNCTION get_faq_categories_with_count()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  faq_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fc.id,
    fc.name,
    fc.slug,
    fc.description,
    COUNT(f.id) as faq_count,
    fc.created_at,
    fc.updated_at
  FROM faq_categories fc
  LEFT JOIN faqs f ON fc.id = f.category_id
  GROUP BY fc.id, fc.name, fc.slug, fc.description, fc.created_at, fc.updated_at
  ORDER BY fc.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default categories
INSERT INTO faq_categories (name, slug, description) VALUES
  ('General', 'general', 'General questions and information'),
  ('Technical', 'technical', 'Technical support and troubleshooting'),
  ('Billing', 'billing', 'Billing and payment related questions'),
  ('Support', 'support', 'Customer support and assistance'),
  ('Account', 'account', 'Account management and settings')
ON CONFLICT (slug) DO NOTHING; 