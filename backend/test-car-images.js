const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCarImages() {
  console.log('🧪 Testing CarImages functionality...');

  try {
    // Test 1: Get cars with images
    console.log('\n📊 Test 1: Fetching cars with images...');
    const cars = await prisma.car.findMany({
      include: {
        carImages: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      take: 3,
    });

    console.log(`Found ${cars.length} cars`);
    cars.forEach(car => {
      console.log(`- ${car.name}: ${car.carImages.length} images`);
      car.carImages.forEach((img, index) => {
        console.log(`  ${index + 1}. ${img.isPrimary ? '[PRIMARY] ' : ''}${img.imageUrl.substring(0, 50)}...`);
      });
    });

    // Test 2: Get car images count
    console.log('\n📊 Test 2: CarImages statistics...');
    const totalImages = await prisma.carImage.count();
    const primaryImages = await prisma.carImage.count({
      where: { isPrimary: true },
    });
    
    console.log(`Total car images: ${totalImages}`);
    console.log(`Primary images: ${primaryImages}`);

    // Test 3: Test image ordering
    console.log('\n📊 Test 3: Testing image ordering...');
    const carWithImages = await prisma.car.findFirst({
      include: {
        carImages: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      where: {
        carImages: {
          some: {},
        },
      },
    });

    if (carWithImages) {
      console.log(`Car: ${carWithImages.name}`);
      console.log('Image order:');
      carWithImages.carImages.forEach((img, index) => {
        console.log(`  ${img.sortOrder}: ${img.isPrimary ? '[PRIMARY] ' : ''}${img.imageUrl.substring(0, 50)}...`);
      });
    }

    // Test 4: Simulate API response format
    console.log('\n📊 Test 4: API response format simulation...');
    const apiFormatCar = {
      ...carWithImages,
      images: carWithImages?.carImages.map(img => img.imageUrl) || [],
      carImages: undefined,
    };
    
    console.log('API format:');
    console.log(`- Car: ${apiFormatCar.name}`);
    console.log(`- Images array: [${apiFormatCar.images.length} items]`);
    console.log(`- First image: ${apiFormatCar.images[0]?.substring(0, 50)}...`);

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCarImages();