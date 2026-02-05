-- Create footer_styling table
-- This table stores styling configuration for the footer

CREATE TABLE IF NOT EXISTS footer_styling (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Colors
  background_color VARCHAR(7) DEFAULT '#000000',
  text_color VARCHAR(7) DEFAULT '#ffffff',
  link_color VARCHAR(7) DEFAULT '#9ca3af',
  link_hover_color VARCHAR(7) DEFAULT '#ffffff',
  border_color VARCHAR(7) DEFAULT '#374151',
  accent_color VARCHAR(7) DEFAULT '#06b6d4',
  
  -- Typography
  heading_font_size VARCHAR(20) DEFAULT 'text-sm',
  body_font_size VARCHAR(20) DEFAULT 'text-sm',
  link_font_size VARCHAR(20) DEFAULT 'text-sm',
  font_weight VARCHAR(20) DEFAULT 'font-medium',
  line_height VARCHAR(20) DEFAULT 'leading-relaxed',
  
  -- Spacing & Layout
  padding_top VARCHAR(20) DEFAULT 'pt-24',
  padding_bottom VARCHAR(20) DEFAULT 'pb-12',
  padding_x VARCHAR(20) DEFAULT 'px-6',
  section_spacing VARCHAR(20) DEFAULT 'space-y-6',
  column_gap VARCHAR(20) DEFAULT 'gap-12',
  
  -- Visual Effects
  show_shadows BOOLEAN DEFAULT true,
  show_borders BOOLEAN DEFAULT true,
  rounded_corners BOOLEAN DEFAULT false,
  border_width VARCHAR(20) DEFAULT 'border',
  shadow_intensity VARCHAR(20) DEFAULT 'shadow-lg',
  
  -- Background & Effects
  background_gradient BOOLEAN DEFAULT false,
  gradient_from VARCHAR(50) DEFAULT 'from-neutral-900',
  gradient_to VARCHAR(50) DEFAULT 'to-black',
  background_opacity VARCHAR(20) DEFAULT 'bg-opacity-100',
  
  -- Animation & Transitions
  enable_animations BOOLEAN DEFAULT true,
  transition_duration VARCHAR(20) DEFAULT 'duration-300',
  hover_effects BOOLEAN DEFAULT true,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_footer_styling_active ON footer_styling(is_active);
CREATE INDEX IF NOT EXISTS idx_footer_styling_created_at ON footer_styling(created_at);

-- Enable RLS
ALTER TABLE footer_styling ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Footer styling is viewable by everyone" ON footer_styling;
DROP POLICY IF EXISTS "Footer styling is insertable by admin" ON footer_styling;
DROP POLICY IF EXISTS "Footer styling is updatable by admin" ON footer_styling;
DROP POLICY IF EXISTS "Footer styling is deletable by admin" ON footer_styling;

-- Create RLS policies
-- Everyone can view active footer styling
CREATE POLICY "Footer styling is viewable by everyone" ON footer_styling
  FOR SELECT USING (is_active = true);

-- Admin can view all footer styling
CREATE POLICY "Admin can view all footer styling" ON footer_styling
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can insert footer styling
CREATE POLICY "Footer styling is insertable by admin" ON footer_styling
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can update footer styling
CREATE POLICY "Footer styling is updatable by admin" ON footer_styling
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete footer styling
CREATE POLICY "Footer styling is deletable by admin" ON footer_styling
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

CREATE TRIGGER update_footer_styling_updated_at 
  BEFORE UPDATE ON footer_styling 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default styling settings
INSERT INTO footer_styling (
  background_color,
  text_color,
  link_color,
  link_hover_color,
  border_color,
  accent_color,
  heading_font_size,
  body_font_size,
  link_font_size,
  font_weight,
  line_height,
  padding_top,
  padding_bottom,
  padding_x,
  section_spacing,
  column_gap,
  show_shadows,
  show_borders,
  rounded_corners,
  border_width,
  shadow_intensity,
  background_gradient,
  gradient_from,
  gradient_to,
  background_opacity,
  enable_animations,
  transition_duration,
  hover_effects,
  is_active
) VALUES (
  '#000000',
  '#ffffff',
  '#9ca3af',
  '#ffffff',
  '#374151',
  '#06b6d4',
  'text-sm',
  'text-sm',
  'text-sm',
  'font-medium',
  'leading-relaxed',
  'pt-24',
  'pb-12',
  'px-6',
  'space-y-6',
  'gap-12',
  true,
  true,
  false,
  'border',
  'shadow-lg',
  true,
  'from-neutral-900',
  'to-black',
  'bg-opacity-100',
  true,
  'duration-300',
  true,
  true
) ON CONFLICT DO NOTHING; 