const fetch = require('node-fetch')

async function testAuth() {
  try {
    console.log('Testing admin login...')
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@dazzlewheels.com',
        password: 'DazzleAdmin@2024!'
      })
    })
    
    console.log('Response status:', response.status)
    const data = await response.text()
    console.log('Response:', data)
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testAuth()