-- Fix SEO Audit Results table by adding missing columns
-- This migration adds the missing columns that the audit API is trying to use

-- Add missing columns to seo_audit_results table
ALTER TABLE seo_audit_results 
ADD COLUMN IF NOT EXISTS results JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_keywords JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- Update the table comment to reflect the changes
COMMENT ON COLUMN seo_audit_results.results IS 'Complete audit results data in JSON format';
COMMENT ON COLUMN seo_audit_results.target_keywords IS 'Target keywords used for the audit';
COMMENT ON COLUMN seo_audit_results.status IS 'Audit status: pending, processing, completed, failed';

-- Create index for the new status column
CREATE INDEX IF NOT EXISTS idx_seo_audit_status ON seo_audit_results(status);
