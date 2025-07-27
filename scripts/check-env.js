require('dotenv').config();

console.log('🔍 Checking Environment Variables...\n');

const envVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL,
};

let allSet = true;

Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${key.includes('KEY') ? '***SET***' : value}`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
    allSet = false;
  }
});

console.log('\n📁 Environment file check:');
try {
  const fs = require('fs');
  const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} not found`);
    }
  });
} catch (error) {
  console.log('⚠️ Could not check for .env files');
}

if (!allSet) {
  console.log('\n❌ Some environment variables are missing!');
  console.log('   Please create a .env.local file with the required variables.');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
} 