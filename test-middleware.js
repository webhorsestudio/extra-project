const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Change if your dev server runs elsewhere

const userAgents = {
  desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  tablet: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
};

async function testUserAgent(name, userAgent) {
  try {
    console.log(`\n--- Testing ${name} user agent ---`);
    console.log(`User Agent: ${userAgent.substring(0, 50)}...`);
    
    const response = await axios.get(BASE_URL, {
      maxRedirects: 0,
      headers: { 'User-Agent': userAgent }
    });
    console.log(`✅ [${name}] Status: ${response.status} - No redirect`);
    console.log(`📄 Final URL: ${response.config.url}`);
  } catch (err) {
    if (err.response && err.response.status === 307) {
      console.log(`🔄 [${name}] Redirected to: ${err.response.headers.location}`);
      console.log(`📄 Original URL: ${err.config.url}`);
    } else if (err.response) {
      console.log(`❌ [${name}] Status: ${err.response.status}`);
      console.log(`📄 URL: ${err.config.url}`);
    } else {
      console.error(`❌ [${name}] Error:`, err.message);
    }
  }
}

async function testAllUserAgents() {
  console.log('🚀 Starting middleware test...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  for (const [name, ua] of Object.entries(userAgents)) {
    await testUserAgent(name, ua);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Test Summary:');
  console.log('- Desktop should show no redirect (stay on /)');
  console.log('- Mobile/Tablet should redirect to /mobile');
  console.log('- Check your Next.js dev server console for middleware logs');
}

// Run the test
testAllUserAgents().catch(console.error); 