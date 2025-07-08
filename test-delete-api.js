// Test script to check if the delete API is working
const fetch = require('node-fetch');

async function testDeleteAPI() {
  try {
    // Replace with an actual inquiry ID from your database
    const inquiryId = 'test-inquiry-id';
    
    console.log('Testing delete API for inquiry:', inquiryId);
    
    const response = await fetch(`http://localhost:3000/api/admin/inquiries/${inquiryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      // Note: This test won't work without proper authentication
      // You'll need to add proper auth headers for a real test
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    } else {
      const result = await response.json();
      console.log('Success response:', result);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDeleteAPI(); 