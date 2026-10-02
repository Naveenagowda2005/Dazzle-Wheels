const { execSync } = require('child_process');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting CarImages table migration process...');

  try {
    // Step 1: Generate and apply Prisma migration
    console.log('📝 Generating Prisma migration...');
    execSync('npx prisma migrate dev --name add-car-images-table', { 
      stdio: 'inherit',
      cwd: __dirname 
    });

    // Step 2: Generate Prisma client
    console.log('🔄 Generating Prisma client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: __dirname 
    });

    // Step 3: Run data migration
    console.log('📊 Running data migration...');
    execSync('node migrate-car-images.js', { 
      stdio: 'inherit',
      cwd: __dirname 
    });

    // Step 4: Remove images column (optional - commented out for safety)
    console.log('⚠️  Manual step required:');
    console.log('   After verifying the migration worked correctly, you can remove the images column from the Car model');
    console.log('   by running: npx prisma migrate dev --name remove-car-images-column');

    console.log('✅ Migration completed successfully!');
    console.log('🔍 Please test the application to ensure everything works correctly.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();