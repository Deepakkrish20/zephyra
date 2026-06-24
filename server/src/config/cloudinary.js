import { v2 as cloudinary } from 'cloudinary';

// Cloudinary connection configuration placeholder
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || 'mock_cloudinary_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock_cloudinary_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_cloudinary_secret',
});

console.log('[Config] Cloudinary integration instantiated (placeholders)');

export default cloudinary;