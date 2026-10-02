const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAdminLogin() {
  console.log('🔍 Testing Admin Login...\n');

  try {
    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@dazzlewheels.com' }
    });

    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('DazzleAdmin@2024!', 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          name: 'Admin',
          email: 'admin@dazzlewheels.com',
          password: hashedPassword,
          role: 'ADMIN',
          phone: '+917760322345'
        }
      });
      
      console.log('✅ Admin user created:', newAdmin.email);
      return;
    }

    console.log('✅ Admin user found:', admin.email);
    console.log('📋 Admin details:');
    console.log(`   - ID: ${admin.id}`);
    console.log(`   - Name: ${admin.name}`);
    console.log(`   - Email: ${admin.email}`);
    console.log(`   - Role: ${admin.role}`);
    console.log(`   - Phone: ${admin.phone}`);
    console.log(`   - Created: ${admin.createdAt}`);

    // Test password
    console.log('\n🔐 Testing password...');
    const passwordMatch = await bcrypt.compare('DazzleAdmin@2024!', admin.password);
    
    if (passwordMatch) {
      console.log('✅ Password is correct!');
    } else {
      console.log('❌ Password is incorrect!');
      console.log('Updating password...');
      
      const hashedPassword = await bcrypt.hash('DazzleAdmin@2024!', 10);
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Password updated successfully!');
    }

    // Test API endpoint
    console.log('\n🌐 Testing API endpoint...');
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@dazzlewheels.com',
        password: 'DazzleAdmin@2024!'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API login successful!');
      console.log('📋 Response data:');
      console.log(`   - Access Token: ${data.access_token ? 'Present' : 'Missing'}`);
      console.log(`   - User ID: ${data.user?.id}`);
      console.log(`   - User Role: ${data.user?.role}`);
    } else {
      const errorData = await response.json();
      console.log('❌ API login failed!');
      console.log('📋 Error:', errorData);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminLogin();