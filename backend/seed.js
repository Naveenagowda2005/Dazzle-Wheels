const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dazzlewheels.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@dazzlewheels.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+917760322345'
    }
  });

  // Create sample cars
  const cars = [
    {
      name: 'Maruti Swift',
      brand: 'Maruti Suzuki',
      fuelType: 'Petrol',
      seats: 5,
      pricePerHour: 150,
      pricePerDay: 2500,
      city: 'Bangalore',
      description: 'Compact and fuel-efficient car perfect for city drives',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1494976688153-d4d4c4c05b1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ])
    },
    {
      name: 'Hyundai Creta',
      brand: 'Hyundai',
      fuelType: 'Diesel',
      seats: 5,
      pricePerHour: 200,
      pricePerDay: 3500,
      city: 'Bangalore',
      description: 'Premium SUV with advanced features and comfort',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ])
    }
  ];

  for (const car of cars) {
    const existingCar = await prisma.car.findFirst({
      where: { name: car.name }
    });
    
    if (!existingCar) {
      await prisma.car.create({
        data: car
      });
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin login: admin@dazzlewheels.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });