# Branding Settings Setup Guide

## Issue: "Loading settings..." Stuck

The branding settings page is showing "Loading settings..." because of several issues:

1. **Missing Branding Storage Bucket**: The `BrandingSettingsForm` tries to upload files to a `branding` bucket that doesn't exist
2. **Authentication Issues**: The page doesn't properly check for admin role
3. **API Route Usage**: The page uses direct Supabase calls instead of the API route

## Solution Steps

### Step 1: Create the Branding Storage Bucket

#### Option A: Using the Setup Script (Recommended)
```bash
npm run setup:branding-bucket
```

#### Option B: Manual Setup via Supabase Dashboard
1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Enter the following details:
   - **Name**: `branding`
   - **Public bucket**: ✅ Check this option
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`

### Step 2: Set Storage Policies

After creating the bucket, run these SQL commands in your Supabase SQL editor:

```sql
-- Allow authenticated users to upload branding assets
CREATE POLICY "Allow authenticated users to upload branding assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'branding' AND 
  auth.role() = 'authenticated'
);

-- Allow public to view branding assets
CREATE POLICY "Allow public to view branding assets" ON storage.objects
FOR SELECT USING (bucket_id = 'branding');

-- Allow authenticated users to delete branding assets
CREATE POLICY "Allow authenticated users to delete branding assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'branding' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update branding assets
CREATE POLICY "Allow authenticated users to update branding assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'branding' AND 
  auth.role() = 'authenticated'
);
```

### Step 3: Verify Settings Table

Make sure the settings table exists and has the correct structure:

```sql
-- Check if settings table exists
SELECT * FROM settings LIMIT 1;

-- If it doesn't exist, run the migration
-- The migration file: supabase/migrations/20250701000009_create_settings_table.sql
```

### Step 4: Check Authentication

Ensure you have an admin user:

1. Go to **Authentication > Users** in Supabase Dashboard
2. Verify you have a user with admin role
3. If not, create one using: `npm run create-admin`

### Step 5: Test the Branding Page

1. Start the development server: `npm run dev`
2. Navigate to `/admin/settings/branding`
3. The page should now load properly
4. Try uploading a logo or favicon

## Troubleshooting

### If still showing "Loading settings..."

1. **Check Browser Console**: Look for any JavaScript errors
2. **Check Network Tab**: Verify the API calls are working
3. **Check Supabase Logs**: Look for any database errors

### Common Issues

1. **RLS Policy Issues**: Make sure the user has admin role in the profiles table
2. **Storage Bucket Missing**: Ensure the `branding` bucket exists
3. **API Route Errors**: Check if `/api/settings` is working

### Debug Steps

1. **Test API Route Directly**:
   ```bash
   curl http://localhost:3000/api/settings
   ```

2. **Check Authentication**:
   ```javascript
   // In browser console
   const { data: { user } } = await supabase.auth.getUser()
   console.log('User:', user)
   ```

3. **Check User Role**:
   ```javascript
   // In browser console
   const { data: profile } = await supabase
     .from('profiles')
     .select('role')
     .eq('id', user.id)
     .single()
   console.log('Profile:', profile)
   ```

## Files Modified

1. **`src/app/admin/settings/branding/page.tsx`**: Updated to use API route and check admin role
2. **`src/scripts/setup-branding-bucket.ts`**: New script to create branding bucket
3. **`supabase/migrations/20250701000010_create_branding_bucket.sql`**: Migration for branding bucket
4. **`package.json`**: Added setup script

## Next Steps

After fixing the branding settings:

1. Test logo and favicon uploads
2. Verify the images are accessible via public URLs
3. Check that the settings are saved correctly
4. Test the branding assets on the frontend 