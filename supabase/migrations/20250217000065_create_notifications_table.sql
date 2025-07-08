-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  category TEXT NOT NULL DEFAULT 'system' CHECK (category IN ('system', 'user', 'property', 'inquiry')),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 days')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to create notifications
CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy to allow admins to read all notifications
CREATE POLICY "Admins can read all notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy to allow admins to update all notifications
CREATE POLICY "Admins can update all notifications" ON notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy to allow admins to delete all notifications
CREATE POLICY "Admins can delete all notifications" ON notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy to allow all authenticated users to read notifications
CREATE POLICY "Users can read notifications" ON notifications
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- Create policy to allow users to update notification status (mark as read)
-- Note: We'll handle field-level restrictions in the application layer
CREATE POLICY "Users can update notification status" ON notifications
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Create function to automatically delete expired notifications
CREATE OR REPLACE FUNCTION delete_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run the cleanup function daily
-- Note: This requires pg_cron extension to be enabled in Supabase
-- You can also set up a cron job in your application or use Supabase Edge Functions

-- Create function to get notifications with pagination
CREATE OR REPLACE FUNCTION get_notifications(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_status TEXT DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  type TEXT,
  category TEXT,
  status TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  creator_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.category,
    n.status,
    n.created_by,
    n.created_at,
    n.updated_at,
    n.expires_at,
    p.full_name as creator_name
  FROM notifications n
  LEFT JOIN profiles p ON n.created_by = p.id
  WHERE n.expires_at > NOW()
    AND (p_status IS NULL OR n.status = p_status)
    AND (p_type IS NULL OR n.type = p_type)
    AND (p_category IS NULL OR n.category = p_category)
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 