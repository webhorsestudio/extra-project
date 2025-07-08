const https = require('https');

function testPoliciesAPI() {
  console.log('Testing policies API...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/policies?type=privacy',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log('Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Response:', JSON.stringify(jsonData, null, 2));
      } catch (err) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('Error:', err);
  });

  req.end();
}

testPoliciesAPI(); 