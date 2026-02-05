-- Make FAQs publicly accessible
-- Drop existing policies that require authentication
DROP POLICY IF EXISTS "Users can read FAQ categories" ON faq_categories;
DROP POLICY IF EXISTS "Users can read published FAQs" ON faqs;

-- Create new policies that allow public access
-- Anyone can read FAQ categories (public access)
CREATE POLICY "Public can read FAQ categories" ON faq_categories
  FOR SELECT USING (true);

-- Anyone can read published FAQs (public access)
CREATE POLICY "Public can read published FAQs" ON faqs
  FOR SELECT USING (is_published = true); 