const fetch = require('node-fetch')

async function testAnalyticsAPI() {
  console.log('🔍 Testing Analytics API...\n')

  try {
    console.log('Testing analytics overview endpoint...')
    const response = await fetch('http://localhost:3001/api/analytics/overview', {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Analytics API response:')
      console.log(`   - Total Cars: ${data.totalCars}`)
      console.log(`   - Total Users: ${data.totalUsers}`)
      console.log(`   - Total Bookings: ${data.totalBookings}`)
      console.log(`   - Total Revenue: ₹${data.totalRevenue}`)
      console.log(`   - Booking Status:`)
      console.log(`     * Active: ${data.bookingsByStatus.active}`)
      console.log(`     * Completed: ${data.bookingsByStatus.completed}`)
      console.log(`     * Pending: ${data.bookingsByStatus.pending}`)
      console.log(`     * Cancelled: ${data.bookingsByStatus.cancelled}`)
    } else {
      console.log(`❌ Analytics API failed: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.log(`   Error: ${errorText}`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAnalyticsAPI()