const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPropertyPage() {
  console.log('🔍 Testing Property Page Data...\n');

  try {
    // 1. Check if properties exist
    console.log('1. Checking properties table...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title, status, latitude, longitude, location')
      .limit(5);

    if (propertiesError) {
      console.error('❌ Properties query failed:', propertiesError);
      return;
    }

    console.log(`✅ Found ${properties?.length || 0} properties`);
    
    if (properties && properties.length > 0) {
      console.log('Sample properties:');
      properties.forEach((prop, index) => {
        console.log(`  ${index + 1}. ${prop.title} (ID: ${prop.id})`);
        console.log(`     Status: ${prop.status}`);
        console.log(`     Location: ${prop.location}`);
        console.log(`     Coordinates: ${prop.latitude}, ${prop.longitude}`);
        console.log('');
      });

      // 2. Test a specific property with full data
      const testPropertyId = properties[0].id;
      console.log(`2. Testing full property data for ID: ${testPropertyId}`);
      
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          description,
          property_type,
          property_collection,
          location_id,
          location,
          latitude,
          longitude,
          created_at,
          updated_at,
          created_by,
          posted_by,
          developer_id,
          parking,
          parking_spots,
          rera_number,
          status,
          is_verified,
          property_images (
            id,
            image_url
          ),
          property_configurations (
            id,
            bhk,
            price,
            area,
            bedrooms,
            bathrooms,
            ready_by
          ),
          property_locations (
            id,
            name,
            description
          ),
          developer:property_developers (
            id,
            name,
            website,
            address,
            contact_info
          ),
          property_amenity_relations (
            id,
            amenity_id,
            property_amenities (
              id,
              name
            )
          )
        `)
        .eq('id', testPropertyId)
        .eq('status', 'active')
        .single();

      if (propertyError) {
        console.error('❌ Property detail query failed:', propertyError);
        return;
      }

      console.log('✅ Property detail query successful');
      console.log('Property data:');
      console.log(`  Title: ${property.title}`);
      console.log(`  Status: ${property.status}`);
      console.log(`  Location: ${property.location}`);
      console.log(`  Coordinates: ${property.latitude}, ${property.longitude}`);
      console.log(`  Images: ${property.property_images?.length || 0}`);
      console.log(`  Configurations: ${property.property_configurations?.length || 0}`);
      console.log(`  Locations: ${property.property_locations?.length || 0}`);
      console.log(`  Developer: ${property.developer ? 'Yes' : 'No'}`);
      console.log(`  Amenities: ${property.property_amenity_relations?.length || 0}`);

      // 3. Check what components would render
      console.log('\n3. Component rendering analysis:');
      
      const hasCoordinates = !!(property.latitude && property.longitude);
      const hasConfigurations = property.property_configurations && property.property_configurations.length > 0;
      const hasLocationData = property.property_locations && property.property_locations.length > 0;
      const hasImages = property.property_images && property.property_images.length > 0;
      const hasDeveloper = !!property.developer;
      const hasAmenities = property.property_amenity_relations && property.property_amenity_relations.length > 0;

      console.log(`  PropertyLocationMap: ${hasCoordinates ? '✅ Will render' : '❌ Missing coordinates'}`);
      console.log(`  Available Configurations: ${hasConfigurations ? '✅ Will render' : '❌ No configurations'}`);
      console.log(`  Location Info: ${hasLocationData ? '✅ Will render' : '❌ No location data'}`);
      console.log(`  Property Gallery: ${hasImages ? '✅ Will render' : '❌ No images'}`);
      console.log(`  Developer Info: ${hasDeveloper ? '✅ Will render' : '❌ No developer'}`);
      console.log(`  Property Features: ${hasAmenities ? '✅ Will render' : '❌ No amenities'}`);

    } else {
      console.log('❌ No properties found in database');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPropertyPage(); 