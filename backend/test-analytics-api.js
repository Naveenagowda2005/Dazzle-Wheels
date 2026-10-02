const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@dazzlewheels.com',
  password: 'DazzleAdmin@2024!'
};

async function testAnalyticsAPI() {
  try {
    console.log('🔍 Testing Analytics API...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (!loginResponse.data.access_token) {
      throw new Error('Failed to get access token');
    }
    
    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful\n');

    // Set up headers with auth token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Test Overview Analytics
    console.log('2. Testing Overview Analytics...');
    const overviewResponse = await axios.get(`${API_BASE_URL}/analytics/overview`, { headers });
    console.log('✅ Overview Analytics:', JSON.stringify(overviewResponse.data, null, 2));
    console.log('');

    // Step 3: Test Bookings Analytics
    console.log('3. Testing Bookings Analytics...');
    const bookingsResponse = await axios.get(`${API_BASE_URL}/analytics/bookings?period=30d`, { headers });
    console.log('✅ Bookings Analytics:', JSON.stringify(bookingsResponse.data, null, 2));
    console.log('');

    // Step 4: Test Revenue Analytics
    console.log('4. Testing Revenue Analytics...');
    const revenueResponse = await axios.get(`${API_BASE_URL}/analytics/revenue?period=30d`, { headers });
    console.log('✅ Revenue Analytics:', JSON.stringify(revenueResponse.data, null, 2));
    console.log('');

    // Step 5: Test Cars Analytics
    console.log('5. Testing Cars Analytics...');
    const carsResponse = await axios.get(`${API_BASE_URL}/analytics/cars`, { headers });
    console.log('✅ Cars Analytics:', JSON.stringify(carsResponse.data, null, 2));
    console.log('');

    // Step 6: Test Users Analytics
    console.log('6. Testing Users Analytics...');
    const usersResponse = await axios.get(`${API_BASE_URL}/analytics/users?period=30d`, { headers });
    console.log('✅ Users Analytics:', JSON.stringify(usersResponse.data, null, 2));
    console.log('');

    // Step 7: Test Popular Cars
    console.log('7. Testing Popular Cars...');
    const popularCarsResponse = await axios.get(`${API_BASE_URL}/analytics/popular-cars`, { headers });
    console.log('✅ Popular Cars:', JSON.stringify(popularCarsResponse.data, null, 2));
    console.log('');

    // Step 8: Test Search Trends
    console.log('8. Testing Search Trends...');
    const searchTrendsResponse = await axios.get(`${API_BASE_URL}/analytics/search-trends`, { headers });
    console.log('✅ Search Trends:', JSON.stringify(searchTrendsResponse.data, null, 2));
    console.log('');

    // Step 9: Test Geographic Data
    console.log('9. Testing Geographic Data...');
    const geographicResponse = await axios.get(`${API_BASE_URL}/analytics/geographic`, { headers });
    console.log('✅ Geographic Data:', JSON.stringify(geographicResponse.data, null, 2));
    console.log('');

    console.log('🎉 All Analytics API tests passed successfully!');

  } catch (error) {
    console.error('❌ Analytics API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

// Run the test
testAnalyticsAPI();