# Admin Password Update Guide

This guide explains how to update the admin user's password to "Krishna@2025" using different methods.

## Method 1: Using Migration Files (Recommended)

### Option A: Simple Password Update Migration
Run the migration file `20250701000063_update_admin_password.sql` which will:
- Find the first admin user in the system
- Update their password to "Krishna@2025"
- Verify the update was successful

### Option B: Comprehensive Admin User Migration
Run the migration file `20250701000064_create_or_update_admin_user.sql` which will:
- Check if an admin user exists
- If exists: update the password to "Krishna@2025"
- If not exists: create a new admin user with the password
- Ensure proper profile setup with admin role

## Method 2: Direct SQL Script

Run the standalone SQL script `update-admin-password.sql` directly in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `update-admin-password.sql`
4. Execute the script

This script will:
- Show existing admin users
- Update the password for the first admin user found
- Verify the update was successful

## Method 3: Node.js Script

Run the Node.js script from the command line:

```bash
cd extra-project
node scripts/update-admin-password.js
```

This script will:
- Use the Supabase admin client to find admin users
- Update the password using the official Supabase API
- Create a new admin user if none exists
- Provide detailed console output

## Prerequisites

### For Method 3 (Node.js Script):
1. Install dependencies:
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

2. Ensure your `.env` file contains:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Verification

After running any method, you can verify the password update by:

1. **Checking the database:**
   ```sql
   SELECT 
       u.id,
       u.email,
       p.role,
       p.full_name
   FROM auth.users u
   JOIN profiles p ON u.id = p.id
   WHERE p.role = 'admin';
   ```

2. **Testing login:**
   - Go to your admin login page
   - Use the admin email and password "Krishna@2025"
   - Verify you can log in successfully

3. **Testing admin functions:**
   ```sql
   SELECT is_admin() as admin_check;
   ```

## Security Notes

- The password "Krishna@2025" is used as specified in the request
- All methods use secure password hashing (bcrypt)
- The service role key has elevated permissions - keep it secure
- Consider changing the password after initial setup for production use

## Troubleshooting

### No Admin User Found
If no admin user exists, the comprehensive migration or Node.js script will create one automatically.

### Permission Errors
Ensure you're using the service role key for admin operations, not the anon key.

### Migration Errors
If migrations fail, check:
- Supabase connection
- Service role key permissions
- Database schema consistency

## Files Created

1. `supabase/migrations/20250701000063_update_admin_password.sql` - Simple password update
2. `supabase/migrations/20250701000064_create_or_update_admin_user.sql` - Comprehensive admin setup
3. `update-admin-password.sql` - Standalone SQL script
4. `scripts/update-admin-password.js` - Node.js script
5. `ADMIN_PASSWORD_UPDATE.md` - This documentation

Choose the method that best fits your workflow and security requirements. 