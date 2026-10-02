import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SupabaseStorageService {
  private supabase: SupabaseClient | null;
  private bucketName = 'car-images';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey || supabaseKey.includes('your-')) {
      console.warn('⚠️  Supabase Storage not configured. Using fallback mode.');
      console.log('To enable Supabase Storage, update .env with actual Supabase keys.');
      this.supabase = null;
      return;
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.initializeBucket();
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      this.supabase = null;
    }
  }

  private async initializeBucket() {
    if (!this.supabase) {
      return;
    }

    try {
      // Check if bucket exists
      const { data: buckets } = await this.supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);

      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error } = await this.supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
          fileSizeLimit: 5242880, // 5MB
        });

        if (error) {
          console.error('Error creating bucket:', error);
        } else {
          console.log(`Bucket '${this.bucketName}' created successfully`);
        }
      }
    } catch (error) {
      console.error('Error initializing bucket:', error);
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'cars'): Promise<string> {
    if (!this.supabase) {
      console.log('⚠️  Supabase not configured, using fallback placeholder image');
      // Return a placeholder image URL when Supabase is not configured
      const placeholderImages = [
        'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1494976688153-d4d4c4c05b1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ];
      const randomIndex = Math.floor(Math.random() * placeholderImages.length);
      return placeholderImages[randomIndex];
    }

    try {
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

      // Upload file to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;
      console.log('Image uploaded successfully to Supabase:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image to Supabase:', error);
      throw error;
    }
  }

  async uploadMultipleImages(files: Express.Multer.File[], folder: string = 'cars'): Promise<string[]> {
    if (!this.supabase) {
      console.log('⚠️  Supabase not configured, using fallback placeholder images');
      // Return placeholder images when Supabase is not configured
      const placeholderImages = [
        'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1494976688153-d4d4c4c05b1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ];
      return files.map((_, index) => placeholderImages[index % placeholderImages.length]);
    }

    try {
      const uploadPromises = files.map(file => this.uploadImage(file, folder));
      const imageUrls = await Promise.all(uploadPromises);
      console.log(`${imageUrls.length} images uploaded successfully to Supabase`);
      return imageUrls;
    } catch (error) {
      console.error('Error uploading multiple images to Supabase:', error);
      throw error;
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (!this.supabase) {
      console.log('⚠️  Supabase not configured, skipping image deletion');
      return;
    }

    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const folder = pathParts[pathParts.length - 2];
      const filePath = `${folder}/${fileName}`;

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Supabase delete error:', error);
        // Don't throw error for deletion failures
      } else {
        console.log('Image deleted successfully from Supabase:', imageUrl);
      }
    } catch (error) {
      console.error('Error deleting image from Supabase:', error);
      // Don't throw error for deletion failures
    }
  }

  async deleteMultipleImages(imageUrls: string[]): Promise<void> {
    if (!this.supabase) {
      console.log('⚠️  Supabase not configured, skipping multiple image deletion');
      return;
    }

    try {
      const deletePromises = imageUrls.map(url => this.deleteImage(url));
      await Promise.all(deletePromises);
      console.log(`${imageUrls.length} images deleted from Supabase`);
    } catch (error) {
      console.error('Error deleting multiple images from Supabase:', error);
    }
  }

  // Get storage info
  async getStorageInfo() {
    if (!this.supabase) {
      return {
        configured: false,
        message: 'Supabase Storage not configured. Update .env with actual Supabase keys.',
        bucketName: this.bucketName,
        supabaseUrl: this.configService.get('SUPABASE_URL'),
      };
    }

    try {
      const { data: buckets } = await this.supabase.storage.listBuckets();
      return {
        configured: true,
        buckets,
        bucketName: this.bucketName,
        supabaseUrl: this.configService.get('SUPABASE_URL'),
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        configured: false,
        error: error.message,
        bucketName: this.bucketName,
        supabaseUrl: this.configService.get('SUPABASE_URL'),
      };
    }
  }
}