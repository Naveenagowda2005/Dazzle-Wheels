const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testCarsAPI() {
  console.log('🧪 Testing Cars API with CarImages...');

  try {
    // Test 1: Get all cars
    console.log('\n📊 Test 1: GET /cars');
    const carsResponse = await fetch(`${API_BASE}/cars`);
    
    if (!carsResponse.ok) {
      throw new Error(`HTTP ${carsResponse.status}: ${carsResponse.statusText}`);
    }
    
    const carsData = await carsResponse.json();
    console.log(`✅ Found ${carsData.cars.length} cars`);
    
    if (carsData.cars.length > 0) {
      const firstCar = carsData.cars[0];
      console.log(`- First car: ${firstCar.name}`);
      console.log(`- Images: ${firstCar.images.length} items`);
      console.log(`- First image: ${firstCar.images[0]?.substring(0, 50)}...`);
    }

    // Test 2: Get featured cars
    console.log('\n📊 Test 2: GET /cars/featured');
    const featuredResponse = await fetch(`${API_BASE}/cars/featured`);
    
    if (!featuredResponse.ok) {
      throw new Error(`HTTP ${featuredResponse.status}: ${featuredResponse.statusText}`);
    }
    
    const featuredData = await featuredResponse.json();
    console.log(`✅ Found ${featuredData.length} featured cars`);

    // Test 3: Get specific car
    if (carsData.cars.length > 0) {
      const carId = carsData.cars[0].id;
      console.log(`\n📊 Test 3: GET /cars/${carId}`);
      
      const carResponse = await fetch(`${API_BASE}/cars/${carId}`);
      
      if (!carResponse.ok) {
        throw new Error(`HTTP ${carResponse.status}: ${carResponse.statusText}`);
      }
      
      const carData = await carResponse.json();
      console.log(`✅ Car details: ${carData.name}`);
      console.log(`- Images: ${carData.images.length} items`);
      console.log(`- Bookings: ${carData.bookings.length} items`);
    }

    // Test 4: Search cars
    console.log('\n📊 Test 4: GET /cars/search?city=Bangalore');
    const searchResponse = await fetch(`${API_BASE}/cars/search?city=Bangalore`);
    
    if (!searchResponse.ok) {
      throw new Error(`HTTP ${searchResponse.status}: ${searchResponse.statusText}`);
    }
    
    const searchData = await searchResponse.json();
    console.log(`✅ Search results: ${searchData.cars.length} cars`);

    console.log('\n🎉 All API tests passed! CarImages integration working correctly.');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure the backend server is running: npm run start:dev');
    }
  }
}

// Wait a bit for server to start, then test
setTimeout(testCarsAPI, 3000);