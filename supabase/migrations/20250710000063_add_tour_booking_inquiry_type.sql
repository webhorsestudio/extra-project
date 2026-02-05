-- Re-add tour_booking to inquiry_type so "Request a tour" form submissions are accepted
-- (Form sends inquiry_type = 'tour_booking'; constraint was reduced in 20250701000062)

ALTER TABLE inquiries
DROP CONSTRAINT IF EXISTS inquiries_inquiry_type_check;

ALTER TABLE inquiries
ADD CONSTRAINT inquiries_inquiry_type_check
CHECK (inquiry_type IN ('property', 'contact', 'support', 'tour_booking', 'other'));

COMMENT ON COLUMN inquiries.inquiry_type IS 'Type of inquiry: property, contact, support, tour_booking, or other';
