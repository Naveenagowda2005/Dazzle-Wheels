const fetch = require('node-fetch')

async function testAuthLogin() {
  console.log('🔍 Testing Auth Login System...\n')

  try {
    // Test 1: Try admin login
    console.log('1. Testing admin login...')
    const adminLoginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@dazzlewheels.com',
        password: 'DazzleAdmin@2024!'
      })
    })
    
    if (adminLoginResponse.ok) {
      const adminData = await adminLoginResponse.json()
      console.log('✅ Admin login successful!')
      console.log(`   - User: ${adminData.user.name}`)
      console.log(`   - Email: ${adminData.user.email}`)
      console.log(`   - Role: ${adminData.user.role}`)
      console.log(`   - Token: ${adminData.access_token.substring(0, 20)}...`)
    } else {
      const errorText = await adminLoginResponse.text()
      console.log(`❌ Admin login failed: ${adminLoginResponse.status} ${adminLoginResponse.statusText}`)
      console.log(`   Error: ${errorText}`)
    }

    // Test 2: Check users endpoint
    console.log('\n2. Testing users endpoint...')
    const usersResponse = await fetch('http://localhost:3001/api/users', {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json()
      console.log(`✅ Users endpoint working - ${usersData.users.length} users found`)
      usersData.users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`)
      })
    } else {
      const errorText = await usersResponse.text()
      console.log(`❌ Users endpoint failed: ${usersResponse.status} ${usersResponse.statusText}`)
      console.log(`   Error: ${errorText}`)
    }

    // Test 3: Try to register a test user
    console.log('\n3. Testing user registration...')
    const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'TestPassword123!'
      })
    })
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json()
      console.log('✅ User registration successful!')
      console.log(`   - User: ${registerData.user.name}`)
      console.log(`   - Email: ${registerData.user.email}`)
      console.log(`   - Role: ${registerData.user.role}`)
    } else {
      const errorText = await registerResponse.text()
      console.log(`❌ User registration failed: ${registerResponse.status} ${registerResponse.statusText}`)
      console.log(`   Error: ${errorText}`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAuthLogin()