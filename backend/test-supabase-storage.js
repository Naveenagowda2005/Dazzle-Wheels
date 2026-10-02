const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testSupabaseStorage() {
  console.log('🧪 Testing Supabase Storage Integration...\n');

  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`- SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('\n❌ Missing Supabase configuration. Please update your .env file with:');
    console.log('- SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    console.log('\nGet these from: https://supabase.com/dashboard > Settings > API');
    return;
  }

  if (supabaseServiceKey.includes('your-') || supabaseServiceKey.length < 100) {
    console.log('\n⚠️  Placeholder keys detected. Please update .env with actual Supabase keys.');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test 1: List buckets
    console.log('\n🪣 Testing bucket access...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Failed to list buckets:', listError.message);
      return;
    }

    console.log(`✅ Successfully connected to Supabase Storage`);
    console.log(`📦 Found ${buckets.length} bucket(s):`, buckets.map(b => b.name).join(', '));

    // Test 2: Check car-images bucket
    const carImagesBucket = buckets.find(b => b.name === 'car-images');
    if (carImagesBucket) {
      console.log('✅ car-images bucket exists');
      console.log(`   - Public: ${carImagesBucket.public}`);
      console.log(`   - Created: ${carImagesBucket.created_at}`);
    } else {
      console.log('⚠️  car-images bucket not found. Creating it...');
      
      const { error: createError } = await supabase.storage.createBucket('car-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
        fileSizeLimit: 5242880, // 5MB
      });

      if (createError) {
        console.log('❌ Failed to create bucket:', createError.message);
        return;
      }

      console.log('✅ car-images bucket created successfully');
    }

    // Test 3: Test file operations (using a small test image)
    console.log('\n📁 Testing file operations...');
    
    const testFileName = 'cars/test-image.jpg';
    // Create a minimal JPEG header for testing
    const testContent = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xD9
    ]);

    // Upload test file
    const { error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(testFileName, testContent, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.log('❌ Failed to upload test file:', uploadError.message);
      return;
    }

    console.log('✅ Test file uploaded successfully');

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('car-images')
      .getPublicUrl(testFileName);

    console.log('✅ Public URL generated:', urlData.publicUrl);

    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('car-images')
      .remove([testFileName]);

    if (deleteError) {
      console.log('⚠️  Failed to delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up successfully');
    }

    console.log('\n🎉 All tests passed! Supabase Storage is ready for car images.');
    console.log('\n📝 Next steps:');
    console.log('1. Start the backend server: npm run start:dev');
    console.log('2. Test image upload through the admin panel');
    console.log('3. Verify images appear in car listings');

  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your Supabase keys are correct');
    console.log('2. Check your Supabase project is active');
    console.log('3. Ensure you have proper permissions');
  }
}

// Run test
testSupabaseStorage();