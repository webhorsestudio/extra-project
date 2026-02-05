-- Add SMTP and email template fields to settings table
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS smtp_host TEXT,
  ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587,
  ADD COLUMN IF NOT EXISTS smtp_username TEXT,
  ADD COLUMN IF NOT EXISTS smtp_password TEXT,
  ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_from TEXT,
  ADD COLUMN IF NOT EXISTS email_from_name TEXT,
  ADD COLUMN IF NOT EXISTS signup_confirmation_subject TEXT DEFAULT 'Confirm your email address',
  ADD COLUMN IF NOT EXISTS signup_confirmation_body TEXT,
  ADD COLUMN IF NOT EXISTS password_reset_subject TEXT DEFAULT 'Reset your password',
  ADD COLUMN IF NOT EXISTS password_reset_body TEXT,
  ADD COLUMN IF NOT EXISTS email_confirmation_enabled BOOLEAN DEFAULT false; 