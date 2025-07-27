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

  console.log('📧 Email confirmation request for:', email);

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

  console.log('✅ User found:', user.id);

  // Generate token and expiry (24 hours)
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Store token in DB
  const { error: insertError } = await supabase
    .from('email_confirmation_tokens')
    .insert({
      user_id: user.id,
      token,
      expires_at: expiresAt,
      used: false,
    });
  if (insertError) {
    console.error('❌ Token insert error:', insertError);
    return NextResponse.json({ error: 'Could not create confirmation token' }, { status: 500 });
  }

  console.log('✅ Token stored successfully');

  // Fetch SMTP settings and template
  const SETTINGS_UUID = 'ed4ebb8c-40cd-4173-b492-fef97713217b';
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('id', SETTINGS_UUID)
    .single();
  
  if (!settings || !settings.smtp_host || !settings.smtp_username || !settings.smtp_password || !settings.email_from) {
    console.error('❌ SMTP settings not configured:', {
      hasSettings: !!settings,
      smtpHost: !!settings?.smtp_host,
      smtpUsername: !!settings?.smtp_username,
      smtpPassword: !!settings?.smtp_password,
      emailFrom: !!settings?.email_from
    });
    return NextResponse.json({ error: 'SMTP settings not configured' }, { status: 500 });
  }

  console.log('✅ SMTP settings found:', {
    host: settings.smtp_host,
    port: settings.smtp_port,
    username: settings.smtp_username,
    from: settings.email_from
  });

  // Only send confirmation email if enabled
  if (!settings.email_confirmation_enabled) {
    console.log('⚠️ Email confirmation disabled, skipping email send');
    return NextResponse.json({ success: true });
  }

  console.log('✅ Email confirmation enabled, proceeding with email send');

  // Prepare email
  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: Number(settings.smtp_port) || 587,
    secure: !!settings.smtp_secure,
    auth: {
      user: settings.smtp_username,
      pass: settings.smtp_password,
    },
    // Add timeout and debug options
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    debug: false, // Set to false to reduce console noise
    logger: false
  });

  const confirmLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/users/confirm-email?token=${token}`;
  const subject = settings.signup_confirmation_subject || 'Confirm your email address';
  let body = settings.signup_confirmation_body || '';
  body = body
    .replace(/\{\{full_name\}\}/g, user.user_metadata?.full_name || user.email)
    .replace(/\{\{confirmation_link\}\}/g, confirmLink)
    .replace(/\{\{company_name\}\}/g, settings.site_title || 'Our Company');

  console.log('📧 Preparing email:', {
    from: settings.email_from_name ? `${settings.email_from_name} <${settings.email_from}>` : settings.email_from,
    to: user.email,
    subject,
    bodyLength: body.length,
    confirmLink
  });

  try {
    const info = await transporter.sendMail({
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

    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error instanceof Error ? error.message : 'Unknown error');

    // Provide specific error details based on error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Invalid login') || errorMessage.includes('Username and Password not accepted')) {
      console.error('🔧 Authentication Error - Check SMTP credentials');
    } else if (errorMessage.includes('SSL') || errorMessage.includes('TLS')) {
      console.error('🔧 SSL/TLS Error - Check port and security settings');
    } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      console.error('🔧 Connection Error - Check SMTP host/port');
    } else if (errorMessage.includes('ETIMEDOUT')) {
      console.error('🔧 Timeout Error - Check network connectivity');
    } else if (errorMessage.includes('EMESSAGE')) {
      console.error('🔧 Message Error - Check email format/content');
    }

    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  // Always return success for security
  console.log('✅ Email confirmation request completed successfully');
  return NextResponse.json({ success: true });
} 