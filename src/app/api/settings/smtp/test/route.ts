import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    smtp_host,
    smtp_port,
    smtp_username,
    smtp_password,
    smtp_secure,
    email_from,
    email_from_name
  } = body;

  if (!smtp_host || !smtp_port || !smtp_username || !smtp_password || !email_from) {
    return NextResponse.json({ error: 'Missing required SMTP fields' }, { status: 400 });
  }

  try {
    console.log('🔍 SMTP Test: Starting connection test with:', {
      host: smtp_host,
      port: smtp_port,
      secure: smtp_secure,
      username: smtp_username,
      email_from
    });

    // Determine secure setting based on port
    let secure = false;
    let requireTLS = false;
    
    if (smtp_port === 465) {
      secure = true; // Use SSL
    } else if (smtp_port === 587) {
      secure = false; // Use STARTTLS
      requireTLS = true;
    } else if (smtp_port === 25) {
      secure = false; // Plain text
    } else {
      // For other ports, use the provided setting
      secure = !!smtp_secure;
    }

    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: Number(smtp_port),
      secure: secure,
      auth: {
        user: smtp_username,
        pass: smtp_password,
      },
      // Additional options for better compatibility
      requireTLS: requireTLS,
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
        ciphers: 'SSLv3'
      },
      // Connection timeout settings
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 60000,     // 60 seconds
      // Debug options for troubleshooting
      debug: true,
      logger: true
    });

    console.log('🔍 SMTP Test: Transporter created, attempting to verify connection...');

    // Verify connection
    await transporter.verify();
    console.log('🔍 SMTP Test: Connection verified successfully');

    // Send a test email
    const testEmailResult = await transporter.sendMail({
      from: email_from_name ? `${email_from_name} <${email_from}>` : email_from,
      to: smtp_username, // Send TO the Gmail account, not the business email
      subject: 'SMTP Test Email - Extra Realty',
      text: `This is a test email to verify your SMTP settings.

Test Details:
- Host: ${smtp_host}
- Port: ${smtp_port}
- Secure: ${secure}
- Username: ${smtp_username}
- From Email: ${email_from}

If you receive this email, your SMTP configuration is working correctly.

Best regards,
Extra Realty Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">SMTP Test Email - Extra Realty</h2>
          <p>This is a test email to verify your SMTP settings.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Test Details:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Host:</strong> ${smtp_host}</li>
              <li><strong>Port:</strong> ${smtp_port}</li>
              <li><strong>Secure:</strong> ${secure}</li>
              <li><strong>Username:</strong> ${smtp_username}</li>
              <li><strong>From Email:</strong> ${email_from}</li>
            </ul>
          </div>
          
          <p style="color: #059669; font-weight: bold;">✅ If you receive this email, your SMTP configuration is working correctly.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            <strong>Extra Realty Team</strong>
          </p>
        </div>
      `
    });

    console.log('🔍 SMTP Test: Test email sent successfully:', testEmailResult.messageId);

    return NextResponse.json({ 
      success: true, 
      messageId: testEmailResult.messageId,
      message: 'SMTP connection test successful! Test email sent.'
    });
  } catch (error) {
    console.error('🔍 SMTP Test: Error occurred:', error);
    
    let errorMessage = 'SMTP test failed';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Provide specific guidance for common errors
      if (errorMessage.includes('Invalid login') || errorMessage.includes('Username and Password not accepted')) {
        errorDetails = `
          <strong>Authentication Error:</strong> Your username or password is incorrect.
          <br><br>
          <strong>For Gmail users:</strong>
          <ul>
            <li>Make sure you're using an App Password, not your regular password</li>
            <li>Enable 2-Factor Authentication on your Google account</li>
            <li>Generate an App Password: <a href="https://myaccount.google.com/apppasswords" target="_blank">Google App Passwords</a></li>
            <li>Use the App Password in the SMTP password field</li>
          </ul>
        `;
      } else if (errorMessage.includes('SSL') || errorMessage.includes('TLS')) {
        errorDetails = `
          <strong>SSL/TLS Error:</strong> There's a security configuration issue.
          <br><br>
          <strong>Common solutions:</strong>
          <ul>
            <li>For Gmail: Use port 587 with STARTTLS or port 465 with SSL</li>
            <li>For other providers: Check their recommended port and security settings</li>
            <li>Try different port/security combinations</li>
          </ul>
        `;
      } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
        errorDetails = `
          <strong>Connection Error:</strong> Cannot connect to the SMTP server.
          <br><br>
          <strong>Check:</strong>
          <ul>
            <li>SMTP host is correct (e.g., smtp.gmail.com)</li>
            <li>Port number is correct</li>
            <li>Your internet connection</li>
            <li>Firewall settings</li>
          </ul>
        `;
      }
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 