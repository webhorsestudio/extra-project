const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testClientSideDetection() {
  console.log('🧪 Testing Client-Side Device Detection...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  try {
    // Test desktop user agent
    console.log('\n📱 Testing Desktop User Agent...');
    const desktopResponse = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('✅ Desktop: Status 200 - Should stay on web layout');
    
    // Test mobile user agent
    console.log('\n📱 Testing Mobile User Agent...');
    const mobileResponse = await axios.get(BASE_URL, {
      maxRedirects: 0,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
      }
    });
    console.log('❌ Mobile: Expected redirect but got status 200');
    
  } catch (err) {
    if (err.response && err.response.status === 307) {
      console.log(`🔄 Mobile: Redirected to ${err.response.headers.location}`);
    } else {
      console.error('❌ Error:', err.message);
    }
  }
  
  console.log('\n📋 Instructions for Manual Testing:');
  console.log('1. Open your browser and go to http://localhost:3000');
  console.log('2. Open Developer Tools (F12)');
  console.log('3. Toggle device toolbar (mobile/tablet view)');
  console.log('4. Resize the browser window');
  console.log('5. Check if the page automatically redirects between / and /mobile');
  console.log('6. Look for console logs from DeviceRedirectHandler');
}

testClientSideDetection().catch(console.error); 