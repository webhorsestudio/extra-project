// Simple admin authentication test
const BASE_URL = 'http://localhost:3000';

async function testAdminAuth() {
  console.log('🔐 Testing Admin Authentication...');
  console.log('📍 Base URL:', BASE_URL);
  
  try {
    // Test admin login page
    console.log('\n📋 Testing admin login page...');
    const loginPageResponse = await fetch(`${BASE_URL}/users/login`);
    console.log('Login page status:', loginPageResponse.status);
    
    if (loginPageResponse.status === 200) {
      console.log('✅ Admin login page accessible');
    } else if (loginPageResponse.status === 404) {
      console.log('⚠️ Admin login page not found - check routing');
    } else {
      console.log('❌ Admin login page error:', loginPageResponse.status);
    }
    
    // Test admin dashboard
    console.log('\n📊 Testing admin dashboard...');
    const dashboardResponse = await fetch(`${BASE_URL}/admin/dashboard`);
    console.log('Dashboard status:', dashboardResponse.status);
    
    if (dashboardResponse.status === 200) {
      console.log('✅ Admin dashboard accessible (user logged in)');
    } else if (dashboardResponse.status === 302) {
      console.log('ℹ️ Admin dashboard redirecting to login (expected)');
    } else {
      console.log('❌ Admin dashboard error:', dashboardResponse.status);
    }
    
    // Test inquiries page
    console.log('\n📝 Testing admin inquiries page...');
    const inquiriesResponse = await fetch(`${BASE_URL}/admin/inquiries`);
    console.log('Inquiries page status:', inquiriesResponse.status);
    
    if (inquiriesResponse.status === 200) {
      console.log('✅ Admin inquiries page accessible (user logged in)');
    } else if (inquiriesResponse.status === 302) {
      console.log('ℹ️ Admin inquiries page redirecting to login (expected)');
    } else {
      console.log('❌ Admin inquiries page error:', inquiriesResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n🎉 Admin authentication test completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Visit http://localhost:3000/users/login');
  console.log('2. Log in with admin credentials (admin@example.com / admin123456)');
  console.log('3. Test the inquiries page functionality');
}

testAdminAuth().catch(console.error); 