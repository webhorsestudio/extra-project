-- Create storage policies for property-files bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload property files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-files');

-- Allow authenticated users to view files
CREATE POLICY "Allow authenticated users to view property files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'property-files');

-- Allow authenticated users to update files
CREATE POLICY "Allow authenticated users to update property files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-files')
WITH CHECK (bucket_id = 'property-files');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete property files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-files'); 