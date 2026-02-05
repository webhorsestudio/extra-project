-- Add whatsapp_url column to settings table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN settings.whatsapp_url IS 'WhatsApp business URL for social media links';

-- Update existing records with empty whatsapp_url if they don't have this field
UPDATE settings 
SET whatsapp_url = COALESCE(whatsapp_url, '')
WHERE id IS NOT NULL; 