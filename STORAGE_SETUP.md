# Storage Setup Guide

## Location Images Storage Bucket

To fix the storage upload issues, you need to create a storage bucket in your Supabase project.

### Step 1: Create Storage Bucket

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Enter the following details:
   - **Name**: `location-images`
   - **Public bucket**: ✅ Check this option
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: `image/*`

### Step 2: Set Storage Policies

After creating the bucket, you need to set up storage policies. Go to **Storage > Policies** and add these policies:

#### Policy 1: Allow authenticated users to upload
```sql
CREATE POLICY "Allow authenticated users to upload location images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'location-images' AND 
  auth.role() = 'authenticated'
);
```

#### Policy 2: Allow public to view images
```sql
CREATE POLICY "Allow public to view location images" ON storage.objects
FOR SELECT USING (bucket_id = 'location-images');
```

#### Policy 3: Allow authenticated users to delete their uploads
```sql
CREATE POLICY "Allow authenticated users to delete location images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'location-images' AND 
  auth.role() = 'authenticated'
);
```

### Step 3: Test

After setting up the storage bucket and policies, try adding a location with an image again. The upload should work properly.

### Alternative: Skip Image Upload

If you want to test without images first, the form will now allow you to add locations without images and show a warning message. 