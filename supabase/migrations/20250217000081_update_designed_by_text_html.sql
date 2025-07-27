-- Update existing designed_by_text records to include HTML links
-- This migration updates the default "Designed by" text to include clickable links

UPDATE footer_content 
SET designed_by_text = 'Designed by <a href="https://webhorsestudio.com" target="_blank">Webhorse Studio</a>'
WHERE designed_by_text = 'Designed by Webhorse Studio'; 