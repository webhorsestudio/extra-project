import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';

function generateToken(length = 48) {
  return randomBytes(length).toString('hex');
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Create server-side Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: () => undefined } }
  );

  // Create admin client for auth operations
  const adminSupabase = await createSupabaseAdminClient();

  // Find user by email using admin client
  const { data: users, error: userError } = await adminSupabase.auth.admin.listUsers();
  if (userError) {
    console.log('⚠️ Error fetching users:', userError.message);
    // For security, do not reveal if user exists
    return NextResponse.json({ success: true });
  }

  // Find the user by email
  const user = users.users.find(u => u.email === email);
  if (!user) {
    console.log('⚠️ User not found for email:', email);
    // For security, do not reveal if user exists
    return NextResponse.json({ success: true });
  }

  // Generate token and expiry (1 hour)
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  // Store token in DB
  const { error: insertError } = await supabase
    .from('password_reset_tokens')
    .insert({
      user_id: user.id,
      token,
      expires_at: expiresAt,
      used: false,
    });
  if (insertError) {
    return NextResponse.json({ error: 'Could not create reset token' }, { status: 500 });
  }

  // Fetch SMTP settings and template
  const SETTINGS_UUID = 'ed4ebb8c-40cd-4173-b492-fef97713217b';
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('id', SETTINGS_UUID)
    .single();
  if (!settings || !settings.smtp_host || !settings.smtp_username || !settings.smtp_password || !settings.email_from) {
    return NextResponse.json({ error: 'SMTP settings not configured' }, { status: 500 });
  }

  // Prepare email
  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: Number(settings.smtp_port) || 587,
    secure: !!settings.smtp_secure,
    auth: {
      user: settings.smtp_username,
      pass: settings.smtp_password,
    },
    // Add timeout options
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  const resetLink = `${settings.website_url || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/users/reset-password?token=${token}`;
  const subject = settings.password_reset_subject || 'Reset your password';
  let body = settings.password_reset_body || '';
  body = body
    .replace(/\{\{full_name\}\}/g, user.user_metadata?.full_name || user.email)
    .replace(/\{\{reset_link\}\}/g, resetLink)
    .replace(/\{\{company_name\}\}/g, settings.site_title || 'Our Company');

  try {
    await transporter.sendMail({
      from: settings.smtp_username, // Use the Gmail account as from address
      to: user.email,
      subject,
      text: body,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">${subject}</h2>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${body.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            <strong>${settings.email_from_name || 'Extra Realty Team'}</strong>
          </p>
        </div>
      `
    });
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  // Always return success for security
  return NextResponse.json({ success: true });
} 