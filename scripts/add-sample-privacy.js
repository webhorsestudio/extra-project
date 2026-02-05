const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addSamplePrivacy() {
  try {
    console.log('Adding sample Privacy Policy...')

    // Check if a privacy policy already exists
    const { data: existingPolicy } = await supabase
      .from('policies')
      .select('id')
      .eq('policy_type', 'privacy')
      .single()

    if (existingPolicy) {
      console.log('✅ Privacy policy already exists!')
      console.log('You can view the privacy policy at: /privacy')
      console.log('You can edit the privacy policy in the admin panel at: /admin/frontend-ui/policies')
      return
    }

    // Sample Privacy Policy content in HTML format
    const sampleContent = `
      <h2>Introduction</h2>
      <p>This Privacy Policy explains how our company collects, uses, discloses, and protects your personal information when you use our website and services. By accessing or using our services, you agree to the terms of this Privacy Policy.</p>
      
      <h2>Information We Collect</h2>
      <ul>
        <li>Personal information you provide (such as name, email, phone number, etc.)</li>
        <li>Usage data (such as pages visited, time spent, and interactions)</li>
        <li>Cookies and similar tracking technologies</li>
        <li>Device information and IP addresses</li>
      </ul>
      
      <h2>How We Use Your Information</h2>
      <ul>
        <li>To provide and improve our services</li>
        <li>To communicate with you about your account or inquiries</li>
        <li>To personalize your experience</li>
        <li>To comply with legal obligations</li>
        <li>To send you marketing communications (with your consent)</li>
      </ul>
      
      <h2>Information Sharing</h2>
      <p>We do not sell your personal information. We may share your information with trusted third parties who assist us in operating our website and services, or as required by law.</p>
      
      <h2>Your Rights</h2>
      <ul>
        <li>You have the right to access your personal information</li>
        <li>You may update or correct your personal information at any time</li>
        <li>You may request deletion of your personal information</li>
        <li>You may opt out of marketing communications</li>
        <li>You may disable cookies in your browser settings</li>
      </ul>
      
      <h2>Data Security</h2>
      <p>We implement reasonable security measures to protect your information. However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.</p>
      
      <h2>Data Retention</h2>
      <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations. We will delete your information when it is no longer needed.</p>
      
      <h2>Children's Privacy</h2>
      <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.</p>
      
      <h2>International Transfers</h2>
      <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information.</p>
      
      <h2>Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>
      
      <h2>Contact Us</h2>
      <p>If you have any questions about this Privacy Policy or our data practices, please contact us through our support channels or at privacy@ourcompany.com.</p>
    `

    const { data, error } = await supabase
      .from('policies')
      .insert({
        name: 'Privacy Policy',
        description: 'Privacy policy explaining how we collect, use, and protect your personal information.',
        content: sampleContent,
        policy_type: 'privacy',
        is_active: true
      })
      .select()

    if (error) {
      console.error('Error adding sample privacy policy:', error)
      return
    }

    console.log('✅ Sample Privacy Policy added successfully!')
    console.log('Policy ID:', data[0]?.id)
    console.log('You can now view the privacy policy at: /privacy')
    console.log('You can edit the privacy policy in the admin panel at: /admin/frontend-ui/policies')

  } catch (error) {
    console.error('Error:', error)
  }
}

addSamplePrivacy() 