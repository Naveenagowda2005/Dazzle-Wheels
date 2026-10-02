// Test the database service directly
const fetch = require('node-fetch');

async function testDatabaseService() {
    console.log('🔍 Testing Database Service...\n');
    
    const supabaseUrl = 'https://gqrwjafrebbgpvkfphzw.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcndqYWZyZWJiZ3B2a2ZwaHp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY0NDkzMiwiZXhwIjoyMDg5MjIwOTMyfQ.XJA45LBWGiIcQzLRWfM3kMnj_RQ4jt4siTJDTL-6pLk';
    
    const tables = ['cars', 'users', 'bookings', 'blogs', 'coupons'];
    
    for (const table of tables) {
        console.log(`\n📋 Testing ${table} table:`);
        
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=3`, {
                headers: {
                    'apikey': serviceKey,
                    'Authorization': `Bearer ${serviceKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`   Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Success - Found ${data.length} records`);
                
                if (data.length > 0) {
                    console.log(`   📋 Sample record:`, JSON.stringify(data[0], null, 2));
                } else {
                    console.log(`   ⚠️ Table exists but is empty`);
                }
            } else {
                const errorText = await response.text();
                console.log(`   ❌ Failed: ${errorText}`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
    
    // Test analytics endpoint
    console.log('\n📊 Testing Analytics API:');
    try {
        const response = await fetch('http://localhost:3001/api/analytics/overview');
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ Analytics API working:`, data);
        } else {
            const errorText = await response.text();
            console.log(`   ❌ Analytics API failed: ${errorText}`);
        }
    } catch (error) {
        console.log(`   ❌ Analytics API error: ${error.message}`);
    }
}

testDatabaseService().catch(console.error);