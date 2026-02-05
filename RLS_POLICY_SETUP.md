# RLS Policy Setup Guide

This guide provides step-by-step instructions for adding Row Level Security (RLS) policies to fix the web layout issues you're experiencing.

## Issues Identified

1. **Properties table relationship error**: Code trying to access `bhk_configurations` but table is `property_configurations`
2. **Blogs table column error**: Code trying to access `main_image_url` but column is `featured_image`
3. **Missing public read policies**: Tables need public read access for web layout
4. **RLS policies blocking access**: Some tables have restrictive policies

## Step-by-Step Instructions

### Step 1: Run the Migration

First, apply the migration that fixes all the RLS policy issues:

```bash
# Navigate to your project directory
cd extra-project

# Run the migration using Supabase CLI
npx supabase db push

# Or if you're using the Supabase dashboard, copy and paste the SQL from:
# supabase/migrations/20250701000011_fix_web_layout_issues.sql
```

### Step 2: Verify Migration Success

Check that the migration ran successfully:

```bash
# Check migration status
npx supabase migration list

# Or check in Supabase dashboard under Database > Migrations
```

### Step 3: Test the Web Layout

After running the migration, test your web layout:

```bash
# Start the development server
npm run dev

# Visit your website and check the console for errors
```

### Step 4: Manual Verification (Optional)

If you want to manually verify the policies in Supabase dashboard:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to Authentication > Policies

2. **Check these tables have public read policies:**
   - `properties` - Should allow public read for active properties
   - `blogs` - Should allow public read for published blogs
   - `blog_categories` - Should allow public read
   - `property_categories` - Should allow public read for active categories
   - `property_locations` - Should allow public read for active locations
   - `property_amenities` - Should allow public read for active amenities
   - `property_configurations` - Should allow public read

3. **Check these tables have authenticated user policies:**
   - All tables should allow authenticated users full access (SELECT, INSERT, UPDATE, DELETE)

### Step 5: Test API Endpoints

Test that your API endpoints work correctly:

```bash
# Test properties endpoint
curl http://localhost:3000/api/properties

# Test categories endpoint
curl http://localhost:3000/api/categories

# Test blogs endpoint
curl http://localhost:3000/api/blogs
```

## What the Migration Does

### 1. Enables RLS on All Tables
```sql
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
-- ... and so on for all tables
```

### 2. Creates Public Read Policies
- **Properties**: Public can read active properties
- **Blogs**: Public can read published blogs
- **Categories**: Public can read all categories
- **Locations**: Public can read active locations
- **Amenities**: Public can read active amenities
- **Configurations**: Public can read all configurations

### 3. Creates Authenticated User Policies
- All tables allow authenticated users full access
- This enables admin panel functionality

### 4. Grants Permissions
- Grants necessary database permissions to authenticated users
- Ensures proper schema access

## Troubleshooting

### If you still see errors:

1. **Check Supabase Dashboard**
   - Go to Database > Tables
   - Verify all tables exist
   - Check that RLS is enabled

2. **Check Policies**
   - Go to Authentication > Policies
   - Verify policies are created correctly
   - Check that policies are active

3. **Check Column Names**
   - Verify `blogs.featured_image` exists (not `main_image_url`)
   - Verify `property_configurations` table exists (not `bhk_configurations`)

4. **Check Table Data**
   - Ensure you have some published blogs (`status = 'published'`)
   - Ensure you have some active properties (`status = 'active'`)

### Common Issues:

1. **"Table doesn't exist"**
   - Run all migrations: `npx supabase db push`

2. **"Column doesn't exist"**
   - Check the actual column names in Supabase dashboard
   - Update code to match actual column names

3. **"Policy violation"**
   - Check that RLS policies are created correctly
   - Verify user authentication status

4. **"Permission denied"**
   - Check that authenticated users have proper permissions
   - Verify GRANT statements in migration

## Code Changes Made

The following code files were updated to fix column name issues:

1. **`src/lib/data.ts`**
   - Fixed `bhk_configurations` → `property_configurations`
   - Fixed `main_image_url` → `featured_image`
   - Fixed `is_published` → `status = 'published'`

## Next Steps

After applying the migration:

1. **Test the web layout** - Visit your website and check for errors
2. **Test admin panel** - Ensure admin functionality still works
3. **Add sample data** - Add some properties and blogs to test with
4. **Monitor logs** - Check for any remaining errors

## Support

If you encounter issues:

1. Check the Supabase dashboard for error details
2. Verify all migrations have been applied
3. Check that your Supabase client is configured correctly
4. Ensure your environment variables are set properly

The migration should resolve all the RLS policy issues and allow your web layout to function correctly. 