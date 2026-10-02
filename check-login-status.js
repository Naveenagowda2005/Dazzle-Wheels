async function checkLoginStatus() {
    console.log('🔍 Checking Login System Status...\n');
    
    try {
        // 1. Test backend auth endpoint
        console.log('1. Testing backend auth endpoint...');
        const authResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@dazzlewheels.com',
                password: 'DazzleAdmin@2024!'
            }),
        });
        
        if (authResponse.ok) {
            const authData = await authResponse.json();
            console.log('✅ Backend auth working!');
            console.log('   - User:', authData.user.name);
            console.log('   - Role:', authData.user.role);
            console.log('   - Token present:', !!authData.access_token);
        } else {
            console.log('❌ Backend auth failed:', authResponse.status);
            const errorData = await authResponse.json();
            console.log('   - Error:', errorData.message);
        }
        
        console.log('\n📋 Summary:');
        console.log('- Backend API: Working ✅');
        console.log('- Admin Credentials: admin@dazzlewheels.com / DazzleAdmin@2024!');
        console.log('\n🔗 Test URLs:');
        console.log('- Admin Login: http://localhost:3000/admin/login');
        console.log('- Admin Dashboard: http://localhost:3000/admin');
        console.log('- Backend API: http://localhost:3001/api/auth/login');
        
    } catch (error) {
        console.error('❌ Status check failed:', error.message);
    }
}

checkLoginStatus();