const fetch = require('node-fetch');

async function testSupabaseDirect() {
    console.log('🔍 Testing Supabase Direct Connection...\n');
    
    const supabaseUrl = 'https://gqrwjafrebbgpvkfphzw.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcndqYWZyZWJiZ3B2a2ZwaHp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY0NDkzMiwiZXhwIjoyMDg5MjIwOTMyfQ.XJA45LBWGiIcQzLRWfM3kMnj_RQ4jt4siTJDTL-6pLk';
    
    console.log('🔑 Using Service Role Key:', serviceKey.substring(0, 20) + '...');
    console.log('🌐 Supabase URL:', supabaseUrl);
    
    const tables = ['cars', 'users', 'bookings'];
    
    for (const table of tables) {
        console.log(`\n📋 Testing ${table} table:`);
        
        try {
            const url = `${supabaseUrl}/rest/v1/${table}?select=*&limit=3`;
            console.log('   URL:', url);
            
            const response = await fetch(url, {
                headers: {
                    'apikey': serviceKey,
                    'Authorization': `Bearer ${serviceKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`   Status: ${response.status}`);
            console.log(`   Status Text: ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Success - Found ${data.length} records`);
                
                if (data.length > 0) {
                    console.log(`   📋 First record keys:`, Object.keys(data[0]));
                    console.log(`   📋 Sample data:`, JSON.stringify(data[0], null, 2));
                } else {
                    console.log(`   ⚠️ Table exists but is empty`);
                }
            } else {
                const errorText = await response.text();
                console.log(`   ❌ Failed: ${errorText}`);
                
                // Try with anon key as fallback
                console.log('   🔄 Trying with anon key...');
                const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcndqYWZyZWJiZ3B2a2ZwaHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDQ5MzIsImV4cCI6MjA4OTIyMDkzMn0.kgMho0WTjTOpxnad9p6CuyvKRWF4dFM_HseOM0fHKPI';
                
                const anonResponse = await fetch(url, {
                    headers: {
                        'apikey': anonKey,
                        'Authorization': `Bearer ${anonKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log(`   Anon Status: ${anonResponse.status}`);
                
                if (anonResponse.ok) {
                    const anonData = await anonResponse.json();
                    console.log(`   ✅ Anon Success - Found ${anonData.length} records`);
                } else {
                    const anonError = await anonResponse.text();
                    console.log(`   ❌ Anon Failed: ${anonError}`);
                }
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
    
    console.log('\n🔧 Next Steps:');
    console.log('1. If service role key fails, check Supabase project settings');
    console.log('2. Verify RLS is actually disabled in Supabase dashboard');
    console.log('3. Check if tables exist in the public schema');
    console.log('4. Try using anon key if service role has issues');
}

testSupabaseDirect().catch(console.error);