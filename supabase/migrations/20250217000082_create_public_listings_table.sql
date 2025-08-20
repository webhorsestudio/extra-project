-- Create enum for public listing types
CREATE TYPE public_listing_type AS ENUM (
  'public_property'
);

-- Create enum for public listing status
CREATE TYPE public_listing_status AS ENUM ('draft', 'published', 'archived');

-- Create public_listings table
CREATE TABLE public_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type public_listing_type NOT NULL DEFAULT 'public_property',
    content JSONB NOT NULL DEFAULT '{}',
    excerpt TEXT,
    featured_image_url TEXT,
    status public_listing_status NOT NULL DEFAULT 'draft',
    order_index INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    publish_date TIMESTAMPTZ,
    expire_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger
CREATE TRIGGER update_public_listings_updated_at
    BEFORE UPDATE ON public_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for admins (full access)
CREATE POLICY "Admins can do everything on public_listings" ON public_listings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create policy for public read access (published only)
CREATE POLICY "Public read access to published listings" ON public_listings
    FOR SELECT
    TO anon, authenticated
    USING (status = 'published' AND (expire_date IS NULL OR expire_date > NOW()));

-- Create indexes for performance
CREATE INDEX public_listings_slug_idx ON public_listings (slug);
CREATE INDEX public_listings_status_idx ON public_listings (status);
CREATE INDEX public_listings_type_idx ON public_listings (type);
CREATE INDEX public_listings_order_idx ON public_listings (order_index);
CREATE INDEX public_listings_publish_date_idx ON public_listings (publish_date);
CREATE INDEX public_listings_expire_date_idx ON public_listings (expire_date);
