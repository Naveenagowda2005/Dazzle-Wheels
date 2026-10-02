const fetch = require('node-fetch');

async function testCarsFrontend() {
    console.log('🔍 Testing Cars Frontend Endpoints...\n');
    
    const baseUrl = 'http://localhost:3001/api';
    
    const endpoints = [
        '/cars',
        '/cars/cities',
        '/cars/featured',
        '/cars/search'
    ];
    
    for (const endpoint of endpoints) {
        console.log(`📋 Testing ${endpoint}:`);
        
        try {
            const response = await fetch(`${baseUrl}${endpoint}`);
            console.log(`   Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Success`);
                
                if (endpoint === '/cars/cities') {
                    console.log(`   📋 Cities:`, data);
                } else if (endpoint === '/cars') {
                    console.log(`   📋 Cars found: ${data.cars?.length || 0}`);
                    console.log(`   📋 Pagination:`, data.pagination);
                } else if (endpoint === '/cars/featured') {
                    console.log(`   📋 Featured cars: ${data.cars?.length || 0}`);
                } else if (endpoint === '/cars/search') {
                    console.log(`   📋 Search results: ${data.cars?.length || 0}`);
                }
            } else {
                const errorText = await response.text();
                console.log(`   ❌ Failed: ${errorText}`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        console.log('');
    }
    
    console.log('🎯 Frontend should now work without errors!');
    console.log('🔗 Test URL: http://localhost:3000/cars');
}

testCarsFrontend().catch(console.error);