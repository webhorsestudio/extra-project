const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🧹 Cleanup Expired Notifications');
console.log('===============================');

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase environment variables not configured');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupExpiredNotifications() {
  try {
    console.log('\n📊 Checking for expired notifications...');
    
    // First, get count of expired notifications
    const { data: expiredCount, error: countError } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .lt('expires_at', new Date().toISOString())

    if (countError) {
      console.error('❌ Error counting expired notifications:', countError);
      return;
    }

    console.log(`📋 Found ${expiredCount?.length || 0} expired notifications`);

    if (!expiredCount || expiredCount.length === 0) {
      console.log('✅ No expired notifications to clean up');
      return;
    }

    // Delete expired notifications
    const { data: deletedData, error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id')

    if (deleteError) {
      console.error('❌ Error deleting expired notifications:', deleteError);
      return;
    }

    console.log(`✅ Successfully deleted ${deletedData?.length || 0} expired notifications`);
    
    // Show some details about what was deleted
    if (deletedData && deletedData.length > 0) {
      console.log('🗑️  Deleted notification IDs:');
      deletedData.forEach((notification, index) => {
        console.log(`   ${index + 1}. ${notification.id}`);
      });
    }

    console.log('\n🎉 Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

cleanupExpiredNotifications(); 