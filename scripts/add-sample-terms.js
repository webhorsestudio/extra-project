const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addSampleTerms() {
  try {
    console.log('Adding sample Terms of Use policy...')

    // Check if a terms policy already exists
    const { data: existingPolicy } = await supabase
      .from('policies')
      .select('id')
      .eq('policy_type', 'terms')
      .single()

    if (existingPolicy) {
      console.log('✅ Terms policy already exists!')
      console.log('You can view the terms at: /terms')
      console.log('You can edit the terms in the admin panel at: /admin/frontend-ui/policies')
      return
    }

    // Sample Terms of Use content in HTML format
    const sampleContent = `
      <h2>Introduction</h2>
      <p>This website, including any subdomains and other services, is provided by our company. By accessing or using our services, you agree to be bound by these terms and conditions. Please read them carefully.</p>
      
      <p>These terms constitute a legally binding agreement between our company and the user. If you do not agree to these terms, please do not use our services.</p>
      
      <p>We may update or modify these terms at any time. Continued use of the website after changes constitutes acceptance of the new terms.</p>
      
      <h2>Contents</h2>
      <ul>
        <li>Definitions</li>
        <li>User obligations</li>
        <li>Intellectual property</li>
        <li>Limitation of liability</li>
        <li>Governing law</li>
      </ul>
      
      <h2>Definitions</h2>
      <p>"User" refers to any individual or entity who accesses or uses the website or services. "Content" refers to all text, images, data, and other materials provided on the website.</p>
      
      <h2>User obligations</h2>
      <ul>
        <li>Users must provide accurate information when registering or submitting forms.</li>
        <li>Users agree not to misuse the website or engage in unlawful activities.</li>
        <li>Users are responsible for maintaining the confidentiality of their account credentials.</li>
      </ul>
      
      <h2>Intellectual property</h2>
      <p>All content on this website is the property of our company or its licensors. Unauthorized use, reproduction, or distribution is prohibited.</p>
      
      <h2>Limitation of liability</h2>
      <p>Our company is not liable for any damages arising from the use or inability to use the website or services. The website is provided "as is" without warranties of any kind.</p>
      
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the applicable jurisdiction. Any disputes will be resolved in the courts of that jurisdiction.</p>
      
      <h2>Contact</h2>
      <p>If you have any questions about these terms, please contact us through our support channels.</p>
    `

    const { data, error } = await supabase
      .from('policies')
      .insert({
        name: 'Terms and Conditions',
        description: 'Terms and conditions for using our services and website.',
        content: sampleContent,
        policy_type: 'terms',
        is_active: true
      })
      .select()

    if (error) {
      console.error('Error adding sample terms:', error)
      return
    }

    console.log('✅ Sample Terms of Use policy added successfully!')
    console.log('Policy ID:', data[0]?.id)
    console.log('You can now view the terms at: /terms')
    console.log('You can edit the terms in the admin panel at: /admin/frontend-ui/policies')

  } catch (error) {
    console.error('Error:', error)
  }
}

addSampleTerms() 