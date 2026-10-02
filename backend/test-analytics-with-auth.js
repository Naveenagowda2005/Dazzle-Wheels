const fetch = require('node-fetch')

async function testAnalyticsWithAuth() {
  const baseUrl = 'http://localhost:3001/api'
  
  // First, login as admin to get token
  console.log('🔐 Logging in as admin...')
  
  try {
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@dazzlewheels.com',
        password: 'DazzleAdmin@2024!'
      })
    })
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      console.log(`❌ Login failed: ${loginResponse.status} - ${errorText}`)
      return
    }
    
    const loginData = await loginResponse.json()
    const token = loginData.access_token
    console.log('✅ Login successful')
    
    // Test analytics endpoints with auth
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
    
    console.log('\n🧪 Testing Analytics API Endpoints with Authentication...\n')
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing: ${endpoint}`)
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ ${endpoint}: Success`)
          console.log(`   Response keys: ${Object.keys(data).join(', ')}`)
          
          // Show some sample data
          if (endpoint === '/analytics/overview') {
            console.log(`   Total Cars: ${data.totalCars}, Total Users: ${data.totalUsers}, Total Revenue: ₹${data.totalRevenue}`)
          } else if (endpoint === '/analytics/bookings') {
            console.log(`   Bookings by date entries: ${data.bookingsByDate?.length || 0}`)
            console.log(`   Status distribution entries: ${data.statusDistribution?.length || 0}`)
          } else if (endpoint === '/analytics/revenue') {
            console.log(`   Revenue by date entries: ${data.revenueByDate?.length || 0}`)
            console.log(`   Monthly growth: ${data.monthlyComparison?.growthRate || 0}%`)
          } else if (endpoint === '/analytics/popular-cars') {
            console.log(`   Popular cars count: ${data.length || 0}`)
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
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAnalyticsWithAuth()