// Test script to verify realtime subscriptions for inquiries
const { createClient } = require('@supabase/supabase-js');

// Check environment variables
console.log('🔍 Testing realtime subscriptions for inquiries...');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Supabase environment variables not configured');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testRealtimeInquiries() {
  try {
    console.log('\n📡 Setting up realtime subscription...');
    
    // Set up realtime subscription
    const channel = supabase
      .channel('test-inquiries-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'inquiries' },
        (payload) => {
          console.log('✅ Realtime event received:', {
            eventType: payload.eventType,
            table: payload.table,
            schema: payload.schema,
            record: payload.eventType === 'DELETE' ? payload.old : payload.new
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime subscription active!');
          testInquiryInsertion();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime subscription failed');
        }
      });

    // Wait for subscription to be established
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clean up after 10 seconds
    setTimeout(async () => {
      console.log('\n🧹 Cleaning up subscription...');
      supabase.removeChannel(channel);
      process.exit(0);
    }, 10000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

async function testInquiryInsertion() {
  try {
    console.log('\n📝 Testing inquiry insertion (should trigger realtime event)...');
    
    const testInquiry = {
      name: 'Realtime Test User',
      email: 'realtime-test@example.com',
      phone: '+1234567890',
      message: 'This is a test inquiry for realtime functionality',
      inquiry_type: 'property',
      status: 'unread',
    };

    const { data, error } = await supabase
      .from('inquiries')
      .insert([testInquiry])
      .select();

    if (error) {
      console.error('❌ Insert failed:', error);
      return;
    }

    console.log('✅ Test inquiry inserted:', data[0].id);
    
    // Wait a moment for realtime event
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', data[0].id);

    if (deleteError) {
      console.error('⚠️ Cleanup failed:', deleteError);
    } else {
      console.log('✅ Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Test insertion failed:', error);
  }
}

// Run the test
testRealtimeInquiries(); 