const fetch = require('node-fetch')

const SUPABASE_URL = 'https://gqrwjafrebbgpvkfphzw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcndqYWZyZWJiZ3B2a2ZwaHp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY0NDkzMiwiZXhwIjoyMDg5MjIwOTMyfQ.XJA45LBWGiIcQzLRWfM3kMnj_RQ4jt4siTJDTL-6pLk'

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function createSampleData() {
  console.log('🔍 Creating Sample Data in Supabase...\n')

  try {
    // Create sample cars
    console.log('Creating sample cars...')
    const cars = [
      {
        id: generateId(),
        name: 'Toyota Camry',
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        seats: 5,
        price_per_day: 3200,
        city: 'Mumbai',
        availability: true,
        images: JSON.stringify(['https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Honda City',
        brand: 'Honda',
        model: 'City',
        year: 2023,
        fuel_type: 'Petrol',
        transmission: 'Manual',
        seats: 5,
        price_per_day: 2800,
        city: 'Delhi',
        availability: true,
        images: JSON.stringify(['https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    for (const car of cars) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/cars`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(car)
      })

      if (response.ok) {
        console.log(`✅ Created car: ${car.name}`)
      } else {
        const error = await response.text()
        console.log(`❌ Failed to create car ${car.name}: ${response.status} ${response.statusText}`)
        console.log(`   Error: ${error}`)
      }
    }

    // Create sample users
    console.log('\nCreating sample users...')
    const users = [
      {
        id: generateId(),
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        role: 'USER',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '9876543211',
        role: 'USER',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    for (const user of users) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(user)
      })

      if (response.ok) {
        console.log(`✅ Created user: ${user.name}`)
      } else {
        const error = await response.text()
        console.log(`❌ Failed to create user ${user.name}: ${response.status} ${response.statusText}`)
        console.log(`   Error: ${error}`)
      }
    }

    // Create sample bookings
    console.log('\nCreating sample bookings...')
    const bookings = [
      {
        id: generateId(),
        user_id: users[0].id,
        car_id: cars[0].id,
        pickup_time: new Date().toISOString(),
        drop_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        total_price: 9600,
        booking_status: 'CONFIRMED',
        payment_status: 'COMPLETED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateId(),
        user_id: users[1].id,
        car_id: cars[1].id,
        pickup_time: new Date().toISOString(),
        drop_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        total_price: 5600,
        booking_status: 'PENDING',
        payment_status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    for (const booking of bookings) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(booking)
      })

      if (response.ok) {
        console.log(`✅ Created booking: ${booking.id}`)
      } else {
        const error = await response.text()
        console.log(`❌ Failed to create booking: ${response.status} ${response.statusText}`)
        console.log(`   Error: ${error}`)
      }
    }

    console.log('\n🎉 Sample data creation completed!')

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message)
  }
}

createSampleData()