const fetch = require('node-fetch')

async function testAnalyticsEndpoints() {
  const baseUrl = 'http://localhost:3001/api'
  
  const endpoints = [
    '/analytics/overview',
    '/analytics/bookings',
    '/analytics/revenue',
    '/analytics/cars',
    '/analytics/users',
    '/analytics/popular-cars',
    '/analytics/search-trends',
    '/analytics/geographic'
  ]
  
  console.log('🧪 Testing Analytics API Endpoints...\n')
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`)
      const response = await fetch(`${baseUrl}${endpoint}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${endpoint}: Success`)
        console.log(`   Response keys: ${Object.keys(data).join(', ')}`)
        
        // Show some sample data
        if (endpoint === '/analytics/overview') {
          console.log(`   Total Cars: ${data.totalCars}, Total Users: ${data.totalUsers}, Total Revenue: ₹${data.totalRevenue}`)
        }
      } else {
        const errorText = await response.text()
        console.log(`❌ ${endpoint}: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`)
    }
    console.log('')
  }
}

testAnalyticsEndpoints()