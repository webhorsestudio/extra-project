-- Add policy content and make page_id optional
-- This migration updates the policies table to include actual policy content
-- and makes page linking optional

-- Add content column for storing policy content
ALTER TABLE policies 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Add content_updated_at column to track content changes
ALTER TABLE policies 
ADD COLUMN IF NOT EXISTS content_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Make page_id optional (remove NOT NULL constraint if it exists)
-- Note: page_id is already nullable in the original schema, so this is just for clarity
ALTER TABLE policies 
ALTER COLUMN page_id DROP NOT NULL;

-- Add index for content search
CREATE INDEX IF NOT EXISTS idx_policies_content_search ON policies USING gin(to_tsvector('english', content));

-- Add index for content_updated_at
CREATE INDEX IF NOT EXISTS idx_policies_content_updated_at ON policies(content_updated_at);

-- Update the trigger to also update content_updated_at when content changes
CREATE OR REPLACE FUNCTION update_policy_content_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Update content_updated_at only when content actually changes
    IF OLD.content IS DISTINCT FROM NEW.content THEN
        NEW.content_updated_at = NOW();
    END IF;
    
    -- Always update the general updated_at
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_policies_updated_at ON policies;

-- Create new trigger with content tracking
CREATE TRIGGER update_policies_timestamps 
  BEFORE UPDATE ON policies 
  FOR EACH ROW 
  EXECUTE FUNCTION update_policy_content_timestamp();

-- Add comment to document the new structure
COMMENT ON COLUMN policies.content IS 'The actual content/body of the policy';
COMMENT ON COLUMN policies.content_updated_at IS 'Timestamp when the content was last modified';
COMMENT ON COLUMN policies.page_id IS 'Optional link to a page (for policies that are also pages)'; 