-- Make email and message optional for inquiries (e.g. contact form allows submit without them)

ALTER TABLE inquiries
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN message DROP NOT NULL;

COMMENT ON COLUMN inquiries.email IS 'Contact email (optional)';
COMMENT ON COLUMN inquiries.message IS 'Inquiry message/description (optional)';
