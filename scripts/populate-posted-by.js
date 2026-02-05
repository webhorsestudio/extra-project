const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function populatePostedByFields() {
  console.log('🚀 Starting to populate empty posted_by fields...')
  
  try {
    // Step 1: Get all properties with empty or null posted_by
    console.log('📋 Fetching properties with empty posted_by fields...')
    const { data: propertiesWithEmptyPostedBy, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, posted_by, developer_id')
      .or('posted_by.is.null,posted_by.eq.,posted_by.eq.Unknown User')
    
    if (fetchError) {
      throw new Error(`Error fetching properties: ${fetchError.message}`)
    }
    
    console.log(`📊 Found ${propertiesWithEmptyPostedBy.length} properties with empty posted_by fields`)
    
    if (propertiesWithEmptyPostedBy.length === 0) {
      console.log('✅ No properties found with empty posted_by fields. All good!')
      return
    }
    
    // Step 2: Get all active developers
    console.log('🏢 Fetching active developers...')
    const { data: developers, error: developersError } = await supabase
      .from('property_developers')
      .select('id, name, is_active')
      .eq('is_active', true)
    
    if (developersError) {
      throw new Error(`Error fetching developers: ${developersError.message}`)
    }
    
    console.log(`🏢 Found ${developers.length} active developers`)
    
    if (developers.length === 0) {
      console.log('⚠️  No active developers found. Cannot populate posted_by fields.')
      return
    }
    
    // Step 3: Update properties with developer names
    console.log('🔄 Updating properties with developer names...')
    let updatedCount = 0
    let skippedCount = 0
    
    for (const property of propertiesWithEmptyPostedBy) {
      let developerName = null
      
      // If property has a developer_id, use that developer's name
      if (property.developer_id) {
        const developer = developers.find(d => d.id === property.developer_id)
        if (developer) {
          developerName = developer.name
        }
      }
      
      // If no developer_id or developer not found, use a random developer
      if (!developerName) {
        const randomDeveloper = developers[Math.floor(Math.random() * developers.length)]
        developerName = randomDeveloper.name
      }
      
      // Update the property
      const { error: updateError } = await supabase
        .from('properties')
        .update({ 
          posted_by: developerName,
          updated_at: new Date().toISOString()
        })
        .eq('id', property.id)
      
      if (updateError) {
        console.error(`❌ Error updating property ${property.id} (${property.title}):`, updateError.message)
        skippedCount++
      } else {
        console.log(`✅ Updated property "${property.title}" with posted_by: "${developerName}"`)
        updatedCount++
      }
    }
    
    // Step 4: Summary
    console.log('\n📈 Summary:')
    console.log(`✅ Successfully updated: ${updatedCount} properties`)
    console.log(`❌ Failed to update: ${skippedCount} properties`)
    console.log(`📊 Total processed: ${propertiesWithEmptyPostedBy.length} properties`)
    
    if (updatedCount > 0) {
      console.log('\n🎉 Successfully populated posted_by fields!')
    } else {
      console.log('\n⚠️  No properties were updated.')
    }
    
  } catch (error) {
    console.error('❌ Error in populatePostedByFields:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  populatePostedByFields()
    .then(() => {
      console.log('🏁 Script completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Script failed:', error.message)
      process.exit(1)
    })
}

module.exports = { populatePostedByFields } 