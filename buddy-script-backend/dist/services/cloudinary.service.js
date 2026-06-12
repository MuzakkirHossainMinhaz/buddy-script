import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../config/logger.config.js';
class CloudinaryService {
    constructor() {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        if (!cloudName || !apiKey || !apiSecret) {
            logger.warn('Cloudinary environment variables are missing. File uploads to Cloudinary will fail.');
        }
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });
    }
    /**
     * Upload an image file from the local disk path to Cloudinary.
     * @param localFilePath Path to the file on disk.
     * @param folder Target folder in Cloudinary.
     * @returns The secure URL of the uploaded image.
     */
    async uploadImage(localFilePath, folder = 'buddy-script') {
        try {
            const result = await cloudinary.uploader.upload(localFilePath, {
                folder,
                resource_type: 'image',
            });
            return result.secure_url;
        }
        catch (error) {
            logger.error('Failed to upload image to Cloudinary', { error, localFilePath });
            throw error;
        }
    }
    /**
     * Upload an image buffer directly to Cloudinary.
     * Useful for stateless environments like Vercel serverless functions.
     * @param buffer File buffer from multer memoryStorage.
     * @param folder Target folder in Cloudinary.
     * @returns The secure URL of the uploaded image.
     */
    async uploadImageBuffer(buffer, folder = 'buddy-script') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder,
                resource_type: 'image',
            }, (error, result) => {
                if (error) {
                    logger.error('Failed to upload image buffer to Cloudinary', { error });
                    reject(error);
                }
                else if (result) {
                    resolve(result.secure_url);
                }
                else {
                    reject(new Error('Unknown error uploading buffer to Cloudinary'));
                }
            });
            uploadStream.end(buffer);
        });
    }
    /**
     * Delete an image file from Cloudinary using its public ID or full URL.
     * @param imageUrl Full Cloudinary URL or Public ID of the image.
     */
    async deleteImage(imageUrl) {
        try {
            // Extract public ID from the URL if needed
            // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/public_id.jpg
            const parts = imageUrl.split('/');
            const lastPart = parts.pop();
            if (!lastPart)
                return;
            const folderName = parts.pop(); // e.g. folder
            const publicIdWithExt = folderName ? `${folderName}/${lastPart}` : lastPart;
            const publicId = publicIdWithExt.split('.')[0]; // remove extension
            await cloudinary.uploader.destroy(publicId);
            logger.info('Image deleted from Cloudinary', { publicId });
        }
        catch (error) {
            logger.error('Failed to delete image from Cloudinary', { error, imageUrl });
        }
    }
}
export const cloudinaryService = new CloudinaryService();
//# sourceMappingURL=cloudinary.service.js.map