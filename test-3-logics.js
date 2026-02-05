const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testThreeLogics() {
  console.log('🧪 Testing 3-Logic Device Detection System...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  console.log('\n📋 Testing Scenarios:');
  console.log('1. Initial Load: Loading screen → Check device → Load correct layout');
  console.log('2. Web → Mobile: Instant layout change on screen size change');
  console.log('3. Mobile → Web: Instant layout change on screen size change');
  
  try {
    // Test 1: Initial load with mobile user agent
    console.log('\n🔍 Test 1: Initial Load (Mobile User Agent)');
    const mobileResponse = await axios.get(BASE_URL, {
      maxRedirects: 0,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
      }
    });
    console.log('❌ Expected redirect but got status 200');
    
  } catch (err) {
    if (err.response && err.response.status === 307) {
      console.log(`✅ Mobile redirect working: ${err.response.headers.location}`);
    } else {
      console.log(`❌ Unexpected error: ${err.message}`);
    }
  }
  
  try {
    // Test 2: Initial load with desktop user agent
    console.log('\n🔍 Test 2: Initial Load (Desktop User Agent)');
    const desktopResponse = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('✅ Desktop: No redirect (stays on web layout)');
    
  } catch (err) {
    console.log(`❌ Desktop error: ${err.message}`);
  }
  
  console.log('\n📋 Manual Testing Instructions:');
  console.log('1. Open browser and go to http://localhost:3000');
  console.log('2. Check initial load behavior (should show loading screen)');
  console.log('3. Resize browser window to test instant layout changes');
  console.log('4. Use browser dev tools to simulate mobile/tablet');
  console.log('5. Check console logs for "Screen size change detected" messages');
  
  console.log('\n🎯 Expected Behaviors:');
  console.log('- Initial load: Loading screen for 1.5 seconds');
  console.log('- Screen resize: Instant redirect without loading screen');
  console.log('- Device rotation: Instant layout change');
  console.log('- Console logs should show device type changes');
}

testThreeLogics().catch(console.error); 