const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateCarImages() {
  console.log('🚀 Starting car images migration...');

  try {
    // Get all cars with existing images
    const cars = await prisma.$queryRaw`
      SELECT id, images FROM cars WHERE images IS NOT NULL AND images != ''
    `;

    console.log(`📊 Found ${cars.length} cars with images to migrate`);

    for (const car of cars) {
      try {
        // Parse existing images JSON
        let imageUrls = [];
        if (car.images) {
          try {
            imageUrls = JSON.parse(car.images);
          } catch (e) {
            console.warn(`⚠️  Failed to parse images for car ${car.id}: ${car.images}`);
            continue;
          }
        }

        if (Array.isArray(imageUrls) && imageUrls.length > 0) {
          console.log(`📸 Migrating ${imageUrls.length} images for car ${car.id}`);

          // Create CarImage records
          for (let i = 0; i < imageUrls.length; i++) {
            await prisma.carImage.create({
              data: {
                carId: car.id,
                imageUrl: imageUrls[i],
                isPrimary: i === 0, // First image is primary
                sortOrder: i,
              },
            });
          }

          console.log(`✅ Migrated images for car ${car.id}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating car ${car.id}:`, error);
      }
    }

    console.log('🎉 Car images migration completed successfully!');
    
    // Verify migration
    const totalCarImages = await prisma.carImage.count();
    console.log(`📊 Total car images in new table: ${totalCarImages}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateCarImages()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });