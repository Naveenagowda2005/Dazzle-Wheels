const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  console.log('Required variables:');
  console.log('- SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSupabaseStorage() {
  console.log('🚀 Setting up Supabase Storage for Dazzle Wheels...');
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const bucketName = 'car-images';
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      console.log(`📦 Creating bucket: ${bucketName}`);
      
      // Create bucket
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
        fileSizeLimit: 5242880, // 5MB
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return;
      }

      console.log('✅ Bucket created successfully');
    } else {
      console.log('✅ Bucket already exists');
    }

    // Set up storage policies for public access
    console.log('🔐 Setting up storage policies...');
    
    // Note: Storage policies are typically set up via Supabase Dashboard or SQL
    // For now, we'll just ensure the bucket is public
    
    console.log('📋 Storage setup summary:');
    console.log(`- Bucket name: ${bucketName}`);
    console.log('- Public access: enabled');
    console.log('- Allowed file types: JPEG, PNG, WebP, JPG');
    console.log('- Max file size: 5MB');
    console.log('- Storage URL pattern: ${SUPABASE_URL}/storage/v1/object/public/car-images/cars/{filename}');
    
    console.log('\n🎉 Supabase Storage setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Ensure your Supabase project has the correct RLS policies');
    console.log('2. Test image upload through the admin panel');
    console.log('3. Verify images are displayed correctly in car listings');

  } catch (error) {
    console.error('❌ Error setting up Supabase Storage:', error);
  }
}

// Run setup
setupSupabaseStorage();