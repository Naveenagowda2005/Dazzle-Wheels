import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads', 'cars');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const uploadsDir = path.join(process.cwd(), 'uploads', folder);
      const filePath = path.join(uploadsDir, fileName);

      // Ensure directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Write file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Return URL that can be served by the backend
      const baseUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
      const imageUrl = `${baseUrl.replace('3000', '3001')}/uploads/${folder}/${fileName}`;
      
      console.log('Image uploaded successfully:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      
      const filePath = path.join(process.cwd(), 'uploads', folder, fileName);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Image deleted successfully:', imageUrl);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error for deletion failures
    }
  }
}