const fetch = require('node-fetch')

const SUPABASE_URL = 'https://gqrwjafrebbgpvkfphzw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcndqYWZyZWJiZ3B2a2ZwaHp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY0NDkzMiwiZXhwIjoyMDg5MjIwOTMyfQ.XJA45LBWGiIcQzLRWfM3kMnj_RQ4jt4siTJDTL-6pLk'

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase SQL Connection...\n')

  try {
    // Test 1: Count cars
    console.log('1. Testing cars count...')
    const carsResponse = await fetch(`${SUPABASE_URL}/rest/v1/cars?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    })
    
    if (carsResponse.ok) {
      const countHeader = carsResponse.headers.get('content-range')
      const carsCount = countHeader ? countHeader.split('/')[1] : 0
      console.log(`✅ Cars count: ${carsCount}`)
    } else {
      console.log(`❌ Cars count failed: ${carsResponse.status} ${carsResponse.statusText}`)
    }

    // Test 2: Count users
    console.log('\n2. Testing users count...')
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count&role=eq.USER`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    })
    
    if (usersResponse.ok) {
      const countHeader = usersResponse.headers.get('content-range')
      const usersCount = countHeader ? countHeader.split('/')[1] : 0
      console.log(`✅ Users count: ${usersCount}`)
    } else {
      console.log(`❌ Users count failed: ${usersResponse.status} ${usersResponse.statusText}`)
    }

    // Test 3: Count bookings
    console.log('\n3. Testing bookings count...')
    const bookingsResponse = await fetch(`${SUPABASE_URL}/rest/v1/bookings?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    })
    
    if (bookingsResponse.ok) {
      const countHeader = bookingsResponse.headers.get('content-range')
      const bookingsCount = countHeader ? countHeader.split('/')[1] : 0
      console.log(`✅ Bookings count: ${bookingsCount}`)
    } else {
      console.log(`❌ Bookings count failed: ${bookingsResponse.status} ${bookingsResponse.statusText}`)
    }

    // Test 4: Get sample cars data
    console.log('\n4. Testing cars data...')
    const carsDataResponse = await fetch(`${SUPABASE_URL}/rest/v1/cars?select=id,name,brand,price_per_day&limit=3`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (carsDataResponse.ok) {
      const carsData = await carsDataResponse.json()
      console.log(`✅ Sample cars data:`)
      carsData.forEach(car => {
        console.log(`   - ${car.name} (${car.brand}) - ₹${car.price_per_day}/day`)
      })
    } else {
      console.log(`❌ Cars data failed: ${carsDataResponse.status} ${carsDataResponse.statusText}`)
    }

    // Test 5: Test analytics API endpoint
    console.log('\n5. Testing analytics API endpoint...')
    const analyticsResponse = await fetch('http://localhost:3001/analytics/overview', {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json()
      console.log(`✅ Analytics API response:`)
      console.log(`   - Total Cars: ${analyticsData.totalCars}`)
      console.log(`   - Total Users: ${analyticsData.totalUsers}`)
      console.log(`   - Total Bookings: ${analyticsData.totalBookings}`)
      console.log(`   - Total Revenue: ₹${analyticsData.totalRevenue}`)
    } else {
      console.log(`❌ Analytics API failed: ${analyticsResponse.status} ${analyticsResponse.statusText}`)
      const errorText = await analyticsResponse.text()
      console.log(`   Error: ${errorText}`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testSupabaseConnection()