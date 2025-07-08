-- Add missing columns for support inquiries
-- This script adds the necessary columns to support the enhanced support form

-- Add subject column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'inquiries' AND column_name = 'subject') THEN
        ALTER TABLE inquiries ADD COLUMN subject TEXT;
    END IF;
END $$;

-- Add priority column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'inquiries' AND column_name = 'priority') THEN
        ALTER TABLE inquiries ADD COLUMN priority TEXT DEFAULT 'normal';
    END IF;
END $$;

-- Add category column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'inquiries' AND column_name = 'category') THEN
        ALTER TABLE inquiries ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
END $$;

-- Add attachment_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'inquiries' AND column_name = 'attachment_url') THEN
        ALTER TABLE inquiries ADD COLUMN attachment_url TEXT;
    END IF;
END $$;

-- Add source column if it doesn't exist (for tracking where the inquiry came from)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'inquiries' AND column_name = 'source') THEN
        ALTER TABLE inquiries ADD COLUMN source TEXT DEFAULT 'website';
    END IF;
END $$;

-- Update existing records to have default values
UPDATE inquiries SET 
    priority = COALESCE(priority, 'normal'),
    category = COALESCE(category, 'general'),
    source = COALESCE(source, 'website')
WHERE priority IS NULL OR category IS NULL OR source IS NULL;

-- Create index for better performance on support inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_type_status ON inquiries(inquiry_type, status);
CREATE INDEX IF NOT EXISTS idx_inquiries_priority ON inquiries(priority);
CREATE INDEX IF NOT EXISTS idx_inquiries_category ON inquiries(category);
