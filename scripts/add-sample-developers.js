const { createClient } = require('@supabase/supabase-js')

async function addSampleDevelopers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const sampleDevelopers = [
    {
      name: 'ABC Developers',
      website: 'https://abcdevelopers.com',
      address: '123 Main Street, City Center',
      contact_info: {
        phone: '+91-9876543210',
        email: 'info@abcdevelopers.com',
        office_hours: '9:00 AM - 6:00 PM'
      },
      is_active: true
    },
    {
      name: 'XYZ Properties',
      website: 'https://xyzproperties.com',
      address: '456 Business Park, Tech Hub',
      contact_info: {
        phone: '+91-9876543211',
        email: 'contact@xyzproperties.com',
        office_hours: '8:00 AM - 7:00 PM'
      },
      is_active: true
    },
    {
      name: 'Premium Real Estate',
      website: 'https://premiumrealestate.com',
      address: '789 Luxury Lane, Premium District',
      contact_info: {
        phone: '+91-9876543212',
        email: 'sales@premiumrealestate.com',
        office_hours: '10:00 AM - 8:00 PM'
      },
      is_active: true
    }
  ]

  try {
    console.log('Adding sample developers...')
    
    for (const developer of sampleDevelopers) {
      const { data, error } = await supabase
        .from('property_developers')
        .insert([developer])
        .select()
      
      if (error) {
        console.error(`Error adding ${developer.name}:`, error)
      } else {
        console.log(`Successfully added: ${developer.name}`)
      }
    }
    
    console.log('Sample developers added successfully!')
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

addSampleDevelopers() 