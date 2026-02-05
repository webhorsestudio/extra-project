// Simple test to verify delete operation
const fetch = require('node-fetch');

async function testDeleteOperation() {
  try {
    // Test the delete API endpoint
    const testInquiryId = 'test-id-123';
    const url = `http://localhost:3000/api/admin/inquiries/${testInquiryId}`;
    
    console.log('Testing delete API endpoint...');
    console.log('URL:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    } else {
      const result = await response.json();
      console.log('Success response:', result);
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDeleteOperation(); 