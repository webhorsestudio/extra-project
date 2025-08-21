-- Fix images bucket RLS policies
-- This migration ensures proper access for service_role and public users

-- First, let's check if the images bucket exists and create it if it doesn't
DO $$
BEGIN
    -- Check if images bucket exists
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'images'
    ) THEN
        -- Create the images bucket if it doesn't exist
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'images',
            'images', 
            true,
            5242880, -- 5MB in bytes
            ARRAY[
                'image/jpeg',
                'image/jpg', 
                'image/png',
                'image/gif',
                'image/webp',
                'image/svg+xml',
                'image/bmp',
                'image/tiff'
            ]
        );
        RAISE NOTICE 'Created images bucket';
    ELSE
        RAISE NOTICE 'Images bucket already exists';
    END IF;
END $$;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies for images bucket
DROP POLICY IF EXISTS "Images bucket - service role access" ON storage.objects;
DROP POLICY IF EXISTS "Images bucket - public read" ON storage.objects;
DROP POLICY IF EXISTS "Images bucket - authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Images bucket - full access" ON storage.objects;

-- Policy 1: Service role has full access to images bucket (bypasses RLS)
-- This is the most important policy for your API to work
CREATE POLICY "Images bucket - service role access" ON storage.objects
FOR ALL USING (
    bucket_id = 'images' 
    AND auth.role() = 'service_role'
);

-- Policy 2: Public read access to images (for displaying images on website)
CREATE POLICY "Images bucket - public read" ON storage.objects
FOR SELECT USING (
    bucket_id = 'images'
);

-- Policy 3: Authenticated users can upload to images bucket
CREATE POLICY "Images bucket - authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
);

-- Policy 4: Users can update their own uploaded images
CREATE POLICY "Images bucket - user update own" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
);

-- Policy 5: Users can delete their own uploaded images
CREATE POLICY "Images bucket - user delete own" ON storage.objects
FOR DELETE USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
);

-- Add helpful comments
COMMENT ON POLICY "Images bucket - service role access" ON storage.objects IS 
'Allows service_role to bypass RLS and perform all operations on images bucket. Required for admin API uploads.';

COMMENT ON POLICY "Images bucket - public read" ON storage.objects IS 
'Allows anyone to view/download images from the images bucket. Required for public image display.';

COMMENT ON POLICY "Images bucket - authenticated upload" ON storage.objects IS 
'Allows authenticated users to upload images to the images bucket.';

COMMENT ON POLICY "Images bucket - user update own" ON storage.objects IS 
'Allows users to update images they uploaded to the images bucket.';

COMMENT ON POLICY "Images bucket - user delete own" ON storage.objects IS 
'Allows users to delete images they uploaded to the images bucket.';

-- Verify the policies were created
DO $$
BEGIN
    RAISE NOTICE 'Created RLS policies for images bucket:';
    RAISE NOTICE '- Service role full access (bypasses RLS)';
    RAISE NOTICE '- Public read access';
    RAISE NOTICE '- Authenticated user upload';
    RAISE NOTICE '- User update own images';
    RAISE NOTICE '- User delete own images';
END $$;
