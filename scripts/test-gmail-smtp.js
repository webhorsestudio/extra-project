const nodemailer = require('nodemailer');

// Your Gmail SMTP settings
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'krishnaabhishek7506@gmail.com',
    pass: 'aukg uvjx rsfg gqfw'
  }
};

async function testGmailSMTP() {
  console.log('🧪 Testing Gmail SMTP Configuration...\n');

  try {
    // 1. Create transporter
    console.log('1. Creating SMTP transporter...');
    const transporter = nodemailer.createTransport(smtpConfig);

    // 2. Verify connection
    console.log('2. Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // 3. Send test email
    console.log('3. Sending test email...');
    const testEmail = {
      from: 'Extra Realty <no-reply@extrarealtygroup.com>',
      to: 'krishnaabhishek7506@gmail.com', // Send to your Gmail for testing
      subject: 'Gmail SMTP Test - ' + new Date().toISOString(),
      text: `This is a test email to verify Gmail SMTP configuration.

Configuration:
- Host: ${smtpConfig.host}
- Port: ${smtpConfig.port}
- Username: ${smtpConfig.auth.user}
- From: no-reply@extrarealtygroup.com
- From Name: Extra Realty

If you receive this email, your Gmail SMTP configuration is working correctly.

Sent at: ${new Date().toISOString()}`,
      html: `<h2>Gmail SMTP Test Email</h2>
<p>This is a test email to verify Gmail SMTP configuration.</p>
<h3>Configuration:</h3>
<ul>
<li><strong>Host:</strong> ${smtpConfig.host}</li>
<li><strong>Port:</strong> ${smtpConfig.port}</li>
<li><strong>Username:</strong> ${smtpConfig.auth.user}</li>
<li><strong>From:</strong> no-reply@extrarealtygroup.com</li>
<li><strong>From Name:</strong> Extra Realty</li>
</ul>
<p>If you receive this email, your Gmail SMTP configuration is working correctly.</p>
<p><em>Sent at: ${new Date().toISOString()}</em></p>`
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    console.log('   Envelope:', info.envelope);

    // 4. Test confirmation email template
    console.log('\n4. Testing confirmation email template...');
    const confirmLink = 'http://localhost:3000/users/confirm-email?token=test-token-123';
    const subject = 'Welcome to Extra Realty - Confirm Your Email';
    const body = `Hello Test User,

Thank you for signing up with Extra Realty!

Please confirm your email address by clicking the link below:

${confirmLink}

If you did not create this account, you can safely ignore this email.

Best regards,
The Extra Realty Team`;

    const confirmationEmail = {
      from: 'Extra Realty <no-reply@extrarealtygroup.com>',
      to: 'krishnaabhishek7506@gmail.com',
      subject: `[TEST] ${subject}`,
      text: body,
      html: `<pre style="font-family:inherit">${body}</pre>`
    };

    const confirmInfo = await transporter.sendMail(confirmationEmail);
    console.log('✅ Confirmation email template sent successfully!');
    console.log('   Message ID:', confirmInfo.messageId);
    console.log('   Subject:', confirmationEmail.subject);
    console.log('   Body Length:', body.length);

    console.log('\n🎉 Gmail SMTP test completed successfully!');
    console.log('\n📧 Check your Gmail inbox (krishnaabhishek7506@gmail.com) for the test messages.');
    console.log('\n🔧 Next steps:');
    console.log('   1. Verify you received both test emails');
    console.log('   2. Update your admin SMTP settings with these exact values');
    console.log('   3. Test user registration with email confirmation enabled');

  } catch (error) {
    console.error('❌ Gmail SMTP test failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error command:', error.command);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication Error - Solutions:');
      console.log('   - Verify the App Password is correct');
      console.log('   - Make sure 2FA is enabled on your Gmail account');
      console.log('   - Generate a new App Password if needed');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 Connection Error - Solutions:');
      console.log('   - Check internet connection');
      console.log('   - Verify Gmail SMTP is not blocked by firewall');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n🔧 Timeout Error - Solutions:');
      console.log('   - Check network connectivity');
      console.log('   - Try again in a few minutes');
    }
  }
}

testGmailSMTP(); 