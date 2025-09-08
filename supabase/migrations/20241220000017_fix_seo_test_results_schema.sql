-- Fix SEO Test Results table schema to match API usage
-- This migration adds missing columns and fixes column mismatches

-- Add missing columns to seo_test_results table
ALTER TABLE seo_test_results 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS results JSONB DEFAULT '{}';  -- Add results column for backward compatibility

-- Update the table comment to reflect the changes
COMMENT ON COLUMN seo_test_results.status IS 'Test status: pending, processing, completed, failed';
COMMENT ON COLUMN seo_test_results.results IS 'Test results data in JSON format (alternative to result_data)';

-- Create index for the new status column
CREATE INDEX IF NOT EXISTS idx_seo_test_status ON seo_test_results(status);

-- Update existing records to have proper status
UPDATE seo_test_results 
SET status = 'completed' 
WHERE status IS NULL;

-- Add constraint to ensure status values are valid
ALTER TABLE seo_test_results 
ADD CONSTRAINT check_status_values 
CHECK (status IN ('pending', 'processing', 'completed', 'failed'));
