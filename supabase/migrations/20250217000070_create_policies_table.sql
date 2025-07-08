-- Create policies table
-- This table stores different types of policies that can be linked to pages

CREATE TABLE IF NOT EXISTS policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  policy_type VARCHAR(100) NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_policies_page_id ON policies(page_id);
CREATE INDEX IF NOT EXISTS idx_policies_type ON policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_policies_active ON policies(is_active);
CREATE INDEX IF NOT EXISTS idx_policies_created_at ON policies(created_at);

-- Enable RLS
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Policies are viewable by everyone" ON policies;
DROP POLICY IF EXISTS "Policies are insertable by admin" ON policies;
DROP POLICY IF EXISTS "Policies are updatable by admin" ON policies;
DROP POLICY IF EXISTS "Policies are deletable by admin" ON policies;

-- Create RLS policies
-- Everyone can view active policies
CREATE POLICY "Policies are viewable by everyone" ON policies
  FOR SELECT USING (is_active = true);

-- Admin can view all policies
CREATE POLICY "Admin can view all policies" ON policies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can insert policies
CREATE POLICY "Policies are insertable by admin" ON policies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can update policies
CREATE POLICY "Policies are updatable by admin" ON policies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete policies
CREATE POLICY "Policies are deletable by admin" ON policies
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_policies_updated_at 
  BEFORE UPDATE ON policies 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 