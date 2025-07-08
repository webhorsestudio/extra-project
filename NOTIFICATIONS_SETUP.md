# Notifications System Setup

## Overview
The notifications system allows admins to create and manage notifications that are visible to all users and agents. Notifications are automatically deleted after 15 days.

## Features
- ✅ **Add Notification Button**: Create new notifications with title, message, type, and category
- ✅ **Admin Permissions**: Only admins can create, update, and delete notifications
- ✅ **User Access**: All authenticated users can view notifications
- ✅ **Auto-Expiration**: Notifications are automatically deleted after 15 days
- ✅ **Filtering & Search**: Filter by status, type, category, and search by title/message
- ✅ **Mark as Read**: Users can mark notifications as read
- ✅ **Bulk Actions**: Mark all notifications as read

## Database Setup

### 1. Run the Migration
The notifications table is created by the migration file:
```
supabase/migrations/20250217000065_create_notifications_table.sql
```

### 2. Table Structure
```sql
notifications (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  category TEXT NOT NULL DEFAULT 'system',
  status TEXT NOT NULL DEFAULT 'unread',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 days')
)
```

### 3. RLS Policies
- **Admins**: Full CRUD access
- **Users**: Read access and update status (mark as read)
- **Auto-deletion**: After 15 days

## Components

### 1. NotificationsList
Main component that displays notifications in a table format with:
- Search functionality
- Filtering by status, type, and category
- Add notification button
- Mark as read/delete actions

### 2. AddNotificationForm
Form component for creating new notifications with:
- Title and message fields
- Type selection (info, warning, error, success)
- Category selection (system, user, property, inquiry)

### 3. API Routes
- `GET /api/admin/notifications` - Fetch notifications with filters
- `POST /api/admin/notifications` - Create new notification
- `PUT /api/admin/notifications/[id]` - Update notification status
- `DELETE /api/admin/notifications/[id]` - Delete notification

## Usage

### 1. Access Notifications
Navigate to `/admin/notifications` in the admin panel.

### 2. Create Notification
1. Click "Add Notification" button
2. Fill in the form:
   - **Title**: Notification title (required)
   - **Message**: Notification content (required)
   - **Type**: Info, Warning, Error, or Success
   - **Category**: System, User, Property, or Inquiry
3. Click "Create Notification"

### 3. Manage Notifications
- **Search**: Use the search bar to find specific notifications
- **Filter**: Use dropdown filters for status, type, and category
- **Mark as Read**: Click the dropdown menu on any notification
- **Delete**: Remove notifications using the dropdown menu
- **Mark All Read**: Bulk action to mark all unread notifications as read

## Auto-Cleanup

### Manual Cleanup
Run the cleanup script to manually delete expired notifications:
```bash
node cleanup-expired-notifications.js
```

### Automated Cleanup
To set up automated cleanup, you can:

1. **Use Supabase Edge Functions** (recommended):
   - Create an edge function that runs daily
   - Call the cleanup function

2. **Use External Cron Service**:
   - Set up a cron job to call the cleanup script
   - Run daily at a convenient time

3. **Use Supabase pg_cron** (if enabled):
   ```sql
   SELECT cron.schedule('cleanup-notifications', '0 2 * * *', 'SELECT delete_expired_notifications();');
   ```

## Security

### Permissions
- **Admins**: Full access to create, read, update, delete
- **Users/Agents**: Read-only access, can mark as read
- **Unauthenticated**: No access

### Data Validation
- Title: 1-100 characters
- Message: 1-500 characters
- Type: Must be one of predefined values
- Category: Must be one of predefined values

## Troubleshooting

### Common Issues

1. **"Table not found" error**:
   - Run the migration: `supabase db push`

2. **Permission denied**:
   - Ensure user has admin role
   - Check RLS policies are properly set

3. **Notifications not showing**:
   - Check if notifications have expired
   - Verify user authentication
   - Check browser console for errors

### Debug Commands

```bash
# Test admin login
node test-admin-login.js

# Check admin users
node check-admin-email.js

# Clean up expired notifications
node cleanup-expired-notifications.js
```

## Future Enhancements

Potential improvements:
- [ ] Real-time notifications using Supabase subscriptions
- [ ] Email notifications
- [ ] Push notifications
- [ ] Notification templates
- [ ] Scheduled notifications
- [ ] Notification analytics
- [ ] User notification preferences 