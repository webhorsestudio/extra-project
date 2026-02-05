-- Add theme-related columns to settings table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7) DEFAULT '#06b6d4',
ADD COLUMN IF NOT EXISTS font_size_base VARCHAR(10) DEFAULT '16px',
ADD COLUMN IF NOT EXISTS border_radius VARCHAR(10) DEFAULT '8px',
ADD COLUMN IF NOT EXISTS enable_dark_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_animations BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_shadows BOOLEAN DEFAULT true;

-- Update existing records with default values if they don't have these fields
UPDATE settings 
SET 
  accent_color = COALESCE(accent_color, '#06b6d4'),
  font_size_base = COALESCE(font_size_base, '16px'),
  border_radius = COALESCE(border_radius, '8px'),
  enable_dark_mode = COALESCE(enable_dark_mode, false),
  enable_animations = COALESCE(enable_animations, true),
  enable_shadows = COALESCE(enable_shadows, true)
WHERE id IS NOT NULL;

-- Add comments to the columns
COMMENT ON COLUMN settings.accent_color IS 'Accent color for highlights and focus states';
COMMENT ON COLUMN settings.font_size_base IS 'Base font size for body text';
COMMENT ON COLUMN settings.border_radius IS 'Border radius for buttons, cards, and inputs';
COMMENT ON COLUMN settings.enable_dark_mode IS 'Whether dark mode is enabled';
COMMENT ON COLUMN settings.enable_animations IS 'Whether animations and transitions are enabled';
COMMENT ON COLUMN settings.enable_shadows IS 'Whether box shadows are enabled'; 