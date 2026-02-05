const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testMetadata() {
  try {
    // Test SEO config
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: settings, error } = await supabase
      .from('settings')
      .select('site_title, meta_description, site_url, website_url')
      .single();

    if (error) {
      console.log('❌ Database error:', error.message);
      return;
    }

    console.log('📊 Database settings:');
    console.log('  site_title:', settings.site_title);
    console.log('  meta_description:', settings.meta_description);
    console.log('  site_url:', settings.site_url);
    console.log('  website_url:', settings.website_url);

    // Test what the title should be
    const siteUrl = settings.site_url || settings.website_url || 'https://extrarealty.com';
    const title = settings.site_title || 'Extra Realty - Premium Properties in Bangalore';
    
    console.log('\n🎯 Expected metadata:');
    console.log('  Title:', title);
    console.log('  Site URL:', siteUrl);
    console.log('  Description:', settings.meta_description);

    // Test metadataBase
    const metadataBase = new URL(siteUrl);
    console.log('\n🔧 metadataBase:', metadataBase.toString());

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMetadata();
