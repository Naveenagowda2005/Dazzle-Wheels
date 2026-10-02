const fetch = require('node-fetch');

async function testSupabaseDataFetch() {
    console.log('🔍 Testing Supabase Data Fetch...\n');
    
    const supabaseUrl = 'https://gqrwjafrebbgpvkfphzw.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcndqYWZyZWJiZ3B2a2ZwaHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDQ5MzIsImV4cCI6MjA4OTIyMDkzMn0.kgMho0WTjTOpxnad9p6CuyvKRWF4dFM_HseOM0fHKPI';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcndqYWZyZWJiZ3B2a2ZwaHp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY0NDkzMiwiZXhwIjoyMDg5MjIwOTMyfQ.XJA45LBWGiIcQzLRWfM3kMnj_RQ4jt4siTJDTL-6pLk';
    
    const tables = ['cars', 'users', 'bookings', 'blogs', 'coupons'];
    
    for (const table of tables) {
        console.log(`\n📋 Testing ${table} table:`);
        
        // Test with anon key
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=5`, {
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${anonKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`   Anon Key - Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Anon Key Success - Found ${data.length} records`);
                if (data.length > 0) {
                    console.log(`   📋 Sample record:`, Object.keys(data[0]));
                }
            } else {
                const errorText = await response.text();
                console.log(`   ❌ Anon Key Failed: ${errorText}`);
            }
        } catch (error) {
            console.log(`   ❌ Anon Key Error: ${error.message}`);
        }
        
        // Test with service role key
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=5`, {
                headers: {
                    'apikey': serviceKey,
                    'Authorization': `Bearer ${serviceKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`   Service Key - Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Service Key Success - Found ${data.length} records`);
                if (data.length > 0) {
                    console.log(`   📋 Sample record:`, Object.keys(data[0]));
                }
            } else {
                const errorText = await response.text();
                console.log(`   ❌ Service Key Failed: ${errorText}`);
            }
        } catch (error) {
            console.log(`   ❌ Service Key Error: ${error.message}`);
        }
    }
    
    console.log('\n🔧 Manual Fix Instructions:');
    console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project: gqrwjafrebbgpvkfphzw');
    console.log('3. Go to Settings > API');
    console.log('4. Check if RLS (Row Level Security) is enabled');
    console.log('5. Go to Authentication > Policies');
    console.log('6. Create policies to allow read access to tables');
    console.log('\n📋 Alternative: Use service role key for backend operations');
}

// Only run if node-fetch is available
if (typeof fetch === 'undefined') {
    console.log('❌ node-fetch not available. Install with: npm install node-fetch');
} else {
    testSupabaseDataFetch().catch(console.error);
}