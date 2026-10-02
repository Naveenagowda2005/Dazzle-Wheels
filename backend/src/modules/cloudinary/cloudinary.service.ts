import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {}

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    // Check if we're in demo mode (using demo credentials)
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const isDemoMode = !apiKey || apiKey === 'demo-key';

    if (isDemoMode) {
      // Return a placeholder image URL for demo mode
      console.log('Demo mode: Using placeholder image instead of uploading to Cloudinary');
      const placeholderImages = [
        'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1494976688153-d4d4c4c05b1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ];
      
      // Return a random placeholder image
      const randomIndex = Math.floor(Math.random() * placeholderImages.length);
      return placeholderImages[randomIndex];
    }

    // Real Cloudinary upload for production
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `dazzle-wheels/${folder}`,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: 'fill', quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        },
      );

      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    // Check if we're in demo mode
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const isDemoMode = !apiKey || apiKey === 'demo-key';

    if (isDemoMode) {
      console.log('Demo mode: Skipping image deletion');
      return Promise.resolve();
    }

    // Real Cloudinary deletion for production
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}