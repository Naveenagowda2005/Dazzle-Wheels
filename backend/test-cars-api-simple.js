const fetch = require('node-fetch')

async function testCarsAPI() {
  const baseUrl = 'http://localhost:3001/api'
  
  console.log('🧪 Testing Cars API Endpoints...\n')
  
  const endpoints = [
    { path: '/cars', name: 'All Cars' },
    { path: '/cars/search', name: 'Search Cars' },
    { path: '/cars/featured', name: 'Featured Cars' }
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.path}`)
      const response = await fetch(`${baseUrl}${endpoint.path}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${endpoint.name}: Success`)
        
        if (endpoint.path === '/cars') {
          console.log(`   Cars found: ${data.cars?.length || 0}`)
          console.log(`   Total: ${data.pagination?.total || 0}`)
          if (data.cars && data.cars.length > 0) {
            console.log(`   First car: ${data.cars[0].name} - ₹${data.cars[0].pricePerDay}/day`)
          }
        } else if (endpoint.path === '/cars/featured') {
          console.log(`   Featured cars: ${data.length || 0}`)
          if (data.length > 0) {
            console.log(`   First featured: ${data[0].name} - ₹${data[0].pricePerDay}/day`)
          }
        }
      } else {
        const errorText = await response.text()
        console.log(`❌ ${endpoint.name}: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`)
    }
    console.log('')
  }
}

testCarsAPI()