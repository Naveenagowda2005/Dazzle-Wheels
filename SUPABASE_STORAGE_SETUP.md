# Supabase Storage Setup for Dazzle Wheels

## Overview
This guide explains how to set up Supabase Storage for car image uploads in the Dazzle Wheels application.

## ✅ What's Been Implemented

### Backend Changes
1. **SupabaseStorageService** - New service for handling image uploads to Supabase Storage
2. **Updated CarsController** - Now uses Supabase Storage instead of Cloudinary
3. **Updated CarsService** - Handles image deletion when cars are removed
4. **New Dependencies** - Added `@supabase/supabase-js` and `uuid` packages

### Frontend Changes
1. **Updated Admin Panel** - Removed demo mode warnings
2. **Real Image Storage** - Admin uploaded images are now stored and displayed

## 🔧 Required Setup Steps

### 1. Get Supabase API Keys
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `gqrwjafrebbgpvkfphzw`
3. Navigate to **Settings** > **API**
4. Copy the following keys:
   - **Project URL**: `https://gqrwjafrebbgpvkfphzw.supabase.co`
   - **anon public key**: (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role secret key**: (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. Update Environment Variables
Update `backend/.env` with your actual Supabase keys:

```env
SUPABASE_URL="https://gqrwjafrebbgpvkfphzw.supabase.co"
SUPABASE_ANON_KEY="your-actual-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key-here"
```

### 3. Set Up Storage Bucket
1. Go to **Storage** in your Supabase Dashboard
2. Create a new bucket named `car-images`
3. Set it as **Public bucket**
4. Configure the following settings:
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/jpg`
   - **File size limit**: 5MB
   - **Public access**: Enabled

### 4. Configure Storage Policies (RLS)
In your Supabase SQL Editor, run these commands to set up proper access policies:

```sql
-- Enable RLS on the storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to car images
CREATE POLICY "Public read access for car images" ON storage.objects
FOR SELECT USING (bucket_id = 'car-images');

-- Policy for authenticated users to upload car images
CREATE POLICY "Authenticated users can upload car images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'car-images' 
  AND auth.role() = 'authenticated'
);

-- Policy for authenticated users to update car images
CREATE POLICY "Authenticated users can update car images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'car-images' 
  AND auth.role() = 'authenticated'
);

-- Policy for authenticated users to delete car images
CREATE POLICY "Authenticated users can delete car images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'car-images' 
  AND auth.role() = 'authenticated'
);
```

### 5. Test the Setup
After completing the above steps, run:

```bash
cd backend
npm run supabase:storage
```

This will verify your Supabase Storage configuration.

## 🚀 How It Works

### Image Upload Flow
1. Admin selects images in the admin panel
2. Images are uploaded to Supabase Storage bucket `car-images/cars/`
3. Supabase returns public URLs for the uploaded images
4. URLs are stored in the database with the car record
5. Images are displayed in car listings using the public URLs

### Image Management
- **Upload**: Multiple images (up to 10) per car
- **Storage**: Supabase Storage with public access
- **Deletion**: Automatic cleanup when cars are deleted or images are removed
- **Format**: JPEG, PNG, WebP, JPG (max 5MB each)

### URL Structure
Images are stored with this URL pattern:
```
https://gqrwjafrebbgpvkfphzw.supabase.co/storage/v1/object/public/car-images/cars/{unique-filename}
```

## 🔍 Troubleshooting

### Common Issues

1. **"signature verification failed"**
   - Check that your SUPABASE_SERVICE_ROLE_KEY is correct
   - Ensure the key has proper permissions

2. **"bucket not found"**
   - Create the `car-images` bucket in Supabase Dashboard
   - Ensure it's set as public

3. **"access denied"**
   - Check RLS policies are properly configured
   - Verify the bucket permissions

4. **Images not displaying**
   - Check that the bucket is public
   - Verify the image URLs are accessible
   - Check browser console for CORS errors

### Verification Steps
1. Check Supabase Dashboard > Storage > car-images bucket exists
2. Verify uploaded images appear in the bucket
3. Test image URLs are publicly accessible
4. Confirm images display in car listings

## 📁 File Structure

### New Files Created
```
backend/
├── src/modules/supabase-storage/
│   ├── supabase-storage.service.ts
│   └── supabase-storage.module.ts
└── setup-supabase-storage.js
```

### Modified Files
```
backend/
├── .env (added Supabase keys)
├── package.json (added dependencies & scripts)
├── src/modules/cars/
│   ├── cars.controller.ts (uses SupabaseStorageService)
│   ├── cars.service.ts (handles image deletion)
│   └── cars.module.ts (imports SupabaseStorageModule)

frontend/
└── components/admin/cars-management.tsx (removed demo warnings)
```

## 🎯 Benefits

1. **Real Storage**: Actual uploaded images are stored and displayed
2. **Scalable**: Supabase Storage handles large files and traffic
3. **Secure**: Proper authentication and access controls
4. **Fast**: CDN-backed storage for quick image loading
5. **Cost-effective**: Pay-as-you-use pricing model
6. **Integrated**: Works seamlessly with existing Supabase database

## 🔄 Migration from Demo Mode

The system now:
- ❌ No longer uses placeholder images from Unsplash
- ❌ No longer uses local file storage
- ❌ No longer uses Cloudinary demo mode
- ✅ Uses real Supabase Storage for all images
- ✅ Displays actual admin-uploaded images
- ✅ Provides proper image management (upload/delete)

Your car rental platform now has production-ready image storage! 🎉