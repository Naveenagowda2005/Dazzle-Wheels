const fetch = require('node-fetch')
const bcrypt = require('bcryptjs')

const SUPABASE_URL = 'https://gqrwjafrebbgpvkfphzw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcndqYWZyZWJiZ3B2a2ZwaHp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY0NDkzMiwiZXhwIjoyMDg5MjIwOTMyfQ.XJA45LBWGiIcQzLRWfM3kMnj_RQ4jt4siTJDTL-6pLk'

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function createAdminUser() {
  console.log('🔍 Creating Admin User in Supabase...\n')

  try {
    // First, let's check if the users table exists
    console.log('1. Checking users table...')
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!checkResponse.ok) {
      const error = await checkResponse.text()
      console.log(`❌ Users table check failed: ${checkResponse.status} ${checkResponse.statusText}`)
      console.log(`   Error: ${error}`)
      
      // Try to create the users table using SQL
      console.log('\n2. Attempting to create users table...')
      
      // Since we can't execute raw SQL directly, let's try to create a user record
      // which might auto-create the table if it doesn't exist
    } else {
      console.log('✅ Users table exists')
    }

    // Hash the admin password
    const hashedPassword = await bcrypt.hash('DazzleAdmin@2024!', 12)

    // Create admin user
    console.log('\n3. Creating admin user...')
    const adminUser = {
      id: generateId(),
      name: 'System Administrator',
      email: 'admin@dazzlewheels.com',
      phone: '9999999999',
      password: hashedPassword,
      role: 'ADMIN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(adminUser)
    })

    if (createResponse.ok) {
      const createdUser = await createResponse.json()
      console.log('✅ Admin user created successfully!')
      console.log(`   - ID: ${createdUser[0].id}`)
      console.log(`   - Name: ${createdUser[0].name}`)
      console.log(`   - Email: ${createdUser[0].email}`)
      console.log(`   - Role: ${createdUser[0].role}`)
    } else {
      const error = await createResponse.text()
      console.log(`❌ Admin user creation failed: ${createResponse.status} ${createResponse.statusText}`)
      console.log(`   Error: ${error}`)
    }

    // Also create a test regular user
    console.log('\n4. Creating test user...')
    const testUser = {
      id: generateId(),
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      password: await bcrypt.hash('TestPassword123!', 12),
      role: 'USER',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testUser)
    })

    if (testResponse.ok) {
      const createdTestUser = await testResponse.json()
      console.log('✅ Test user created successfully!')
      console.log(`   - Name: ${createdTestUser[0].name}`)
      console.log(`   - Email: ${createdTestUser[0].email}`)
      console.log(`   - Role: ${createdTestUser[0].role}`)
    } else {
      const error = await testResponse.text()
      console.log(`❌ Test user creation failed: ${testResponse.status} ${testResponse.statusText}`)
      console.log(`   Error: ${error}`)
    }

    console.log('\n🎉 User creation process completed!')

  } catch (error) {
    console.error('❌ Error creating users:', error.message)
  }
}

createAdminUser()