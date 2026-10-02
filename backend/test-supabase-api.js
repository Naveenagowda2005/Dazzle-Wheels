const fetch = require('node-fetch')

async function testSupabaseAPI() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://gqrwjafrebbgpvkfphzw.supabase.co'
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  
  console.log('🔍 Testing Supabase REST API...')
  console.log(`URL: ${supabaseUrl}`)
  
  try {
    // Test the REST API endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    console.log(`✅ REST API Response: ${response.status}`)
    
    if (response.ok) {
      const data = await response.text()
      console.log('Response data:', data.substring(0, 200) + '...')
    } else {
      const errorText = await response.text()
      console.log('Error response:', errorText)
    }
    
    // Test if we can access a specific table (this will fail if project is paused)
    console.log('\n🔍 Testing table access...')
    const tableResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=count`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    })
    
    console.log(`Table access response: ${tableResponse.status}`)
    if (tableResponse.ok) {
      const tableData = await tableResponse.text()
      console.log('✅ Table access successful:', tableData)
    } else {
      const errorText = await tableResponse.text()
      console.log('❌ Table access failed:', errorText)
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message)
  }
}

// Load environment variables
require('dotenv').config()
testSupabaseAPI()