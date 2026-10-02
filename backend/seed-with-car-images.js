const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedWithCarImages() {
  console.log('🌱 Seeding database with CarImages structure...');

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('DazzleAdmin@2024!', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@dazzlewheels.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@dazzlewheels.com',
        password: hashedPassword,
        role: 'ADMIN',
        phone: '+917760322345',
      },
    });

    console.log('✅ Admin user created');

    // Sample car data with images
    const carsData = [
      {
        name: 'Maruti Swift',
        brand: 'Maruti Suzuki',
        fuelType: 'Petrol',
        seats: 5,
        pricePerHour: 150,
        pricePerDay: 2500,
        city: 'Bangalore',
        description: 'Compact and fuel-efficient car perfect for city drives',
        images: [
          'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Hyundai i20',
        brand: 'Hyundai',
        fuelType: 'Petrol',
        seats: 5,
        pricePerHour: 180,
        pricePerDay: 2800,
        city: 'Bangalore',
        description: 'Stylish hatchback with modern features and comfortable interiors',
        images: [
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Honda City',
        brand: 'Honda',
        fuelType: 'Petrol',
        seats: 5,
        pricePerHour: 220,
        pricePerDay: 3500,
        city: 'Bangalore',
        description: 'Premium sedan with excellent comfort and performance',
        images: [
          'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1551830820-330a71b99659?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Tata Nexon',
        brand: 'Tata',
        fuelType: 'Diesel',
        seats: 5,
        pricePerHour: 200,
        pricePerDay: 3200,
        city: 'Bangalore',
        description: 'Compact SUV with robust build and advanced safety features',
        images: [
          'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Mahindra XUV300',
        brand: 'Mahindra',
        fuelType: 'Diesel',
        seats: 5,
        pricePerHour: 250,
        pricePerDay: 4000,
        city: 'Bangalore',
        description: 'Feature-rich compact SUV with premium interiors',
        images: [
          'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Toyota Innova Crysta',
        brand: 'Toyota',
        fuelType: 'Diesel',
        seats: 7,
        pricePerHour: 350,
        pricePerDay: 5500,
        city: 'Bangalore',
        description: 'Spacious MPV perfect for family trips and group travel',
        images: [
          'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      }
    ];

    console.log('🚗 Creating cars with images...');

    for (const carData of carsData) {
      const { images, ...carInfo } = carData;
      
      // Create car
      const car = await prisma.car.create({
        data: carInfo,
      });

      // Create car images
      const carImageData = images.map((imageUrl, index) => ({
        carId: car.id,
        imageUrl,
        isPrimary: index === 0, // First image is primary
        sortOrder: index,
      }));

      await prisma.carImage.createMany({
        data: carImageData,
      });

      console.log(`✅ Created ${car.name} with ${images.length} images`);
    }

    // Create sample coupons
    const coupons = [
      {
        code: 'WELCOME10',
        discount: 10,
        discountType: 'PERCENTAGE',
        minAmount: 1000,
        maxDiscount: 500,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        usageLimit: 100,
      },
      {
        code: 'FIRST500',
        discount: 500,
        discountType: 'FIXED',
        minAmount: 2000,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        usageLimit: 50,
      },
    ];

    for (const coupon of coupons) {
      await prisma.coupon.upsert({
        where: { code: coupon.code },
        update: {},
        create: coupon,
      });
    }

    console.log('✅ Coupons created');

    // Verify the seeding
    const totalCars = await prisma.car.count();
    const totalCarImages = await prisma.carImage.count();
    const totalCoupons = await prisma.coupon.count();

    console.log('\n📊 Seeding Summary:');
    console.log(`- Cars: ${totalCars}`);
    console.log(`- Car Images: ${totalCarImages}`);
    console.log(`- Coupons: ${totalCoupons}`);
    console.log(`- Admin User: ${admin.email}`);

    console.log('\n🎉 Database seeded successfully with CarImages structure!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedWithCarImages();