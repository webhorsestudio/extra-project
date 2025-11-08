-- Create home_testimonials table for managing homepage testimonial content

CREATE TABLE IF NOT EXISTS home_testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  avatar_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_home_testimonials_active ON home_testimonials (is_active);
CREATE INDEX IF NOT EXISTS idx_home_testimonials_order ON home_testimonials (order_index, created_at);

-- Enable RLS
ALTER TABLE home_testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read active home testimonials" ON home_testimonials;
DROP POLICY IF EXISTS "Admins manage home testimonials" ON home_testimonials;

-- Public (anon) users can read active testimonials for frontend rendering
CREATE POLICY "Public can read active home testimonials" ON home_testimonials
  FOR SELECT USING (
    is_active = true
  );

-- Admin users (profiles.role = 'admin') can manage testimonials
CREATE POLICY "Admins manage home testimonials" ON home_testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Ensure updated_at keeps in sync
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_home_testimonials_updated_at
  BEFORE UPDATE ON home_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


