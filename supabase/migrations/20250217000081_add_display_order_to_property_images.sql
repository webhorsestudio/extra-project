-- Migration: Add display_order field to property_images table
-- This allows users to manually arrange the order of property images

-- Add display_order column
ALTER TABLE property_images 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update existing records to have sequential display_order based on created_at
UPDATE property_images 
SET display_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY property_id ORDER BY created_at ASC) as row_num
  FROM property_images
) subquery
WHERE property_images.id = subquery.id;

-- Make display_order NOT NULL after updating existing records
ALTER TABLE property_images 
ALTER COLUMN display_order SET NOT NULL;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_property_images_display_order 
ON property_images(property_id, display_order);

-- Add comment
COMMENT ON COLUMN property_images.display_order IS 'Order of display for property images (lower numbers appear first)';
