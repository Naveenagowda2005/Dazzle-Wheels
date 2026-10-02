const fetch = require('node-fetch')

async function testAnalyticsSimple() {
  const baseUrl = 'http://localhost:3001/api'
  
  console.log('🧪 Testing Analytics API Endpoints (No Auth)...\n')
  
  const endpoints = [
    '/analytics/overview',
    '/analytics/bookings',
    '/analytics/revenue',
    '/analytics/cars',
    '/analytics/popular-cars',
    '/analytics/search-trends'
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`)
      const response = await fetch(`${baseUrl}${endpoint}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${endpoint}: Success`)
        
        // Show sample data structure
        if (endpoint === '/analytics/overview') {
          console.log(`   Total Cars: ${data.totalCars}, Total Users: ${data.totalUsers}, Total Revenue: ₹${data.totalRevenue}`)
        } else if (endpoint === '/analytics/popular-cars') {
          console.log(`   Popular cars count: ${data.length}`)
          if (data.length > 0) {
            console.log(`   Top car: ${data[0].name} (${data[0].bookingCount} bookings)`)
          }
        } else if (endpoint === '/analytics/search-trends') {
          console.log(`   Total searches: ${data.totalSearches}`)
          console.log(`   Top cities: ${data.topCities?.length || 0}`)
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

testAnalyticsSimple()