-- Grant public read-only access to the properties table
-- This allows anyone to view properties, which is necessary for the public website.
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to properties"
ON public.properties FOR SELECT
USING (true);

-- Grant public read-only access to the blogs table
-- This allows anyone to view blog posts on the public website.
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to blogs"
ON public.blogs FOR SELECT
USING (true);

-- Grant public read-only access to the blog_categories table
-- This is also needed for the public website's blog section.
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to blog_categories"
ON public.blog_categories FOR SELECT
USING (true); 