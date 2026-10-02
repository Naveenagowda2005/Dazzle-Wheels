const fetch = require('node-fetch')

const SUPABASE_URL = 'https://gqrwjafrebbgpvkfphzw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcndqYWZyZWJiZ3B2a2ZwaHp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY0NDkzMiwiZXhwIjoyMDg5MjIwOTMyfQ.XJA45LBWGiIcQzLRWfM3kMnj_RQ4jt4siTJDTL-6pLk'

async function testTables() {
  console.log('🔍 Testing Supabase Tables...\n')

  const tables = ['cars', 'users', 'bookings', 'coupons', 'blogs']

  for (const table of tables) {
    try {
      console.log(`Testing ${table} table...`)
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${table} table exists - ${data.length} records found`)
        if (data.length > 0) {
          console.log(`   Sample record keys: ${Object.keys(data[0]).join(', ')}`)
        }
      } else {
        const errorText = await response.text()
        console.log(`❌ ${table} table failed: ${response.status} ${response.statusText}`)
        console.log(`   Error: ${errorText}`)
      }
    } catch (error) {
      console.log(`❌ ${table} table error: ${error.message}`)
    }
    console.log('')
  }
}

testTables()