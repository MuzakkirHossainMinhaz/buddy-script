declare class CloudinaryService {
    constructor();
    /**
     * Upload an image file from the local disk path to Cloudinary.
     * @param localFilePath Path to the file on disk.
     * @param folder Target folder in Cloudinary.
     * @returns The secure URL of the uploaded image.
     */
    uploadImage(localFilePath: string, folder?: string): Promise<string>;
    /**
     * Upload an image buffer directly to Cloudinary.
     * Useful for stateless environments like Vercel serverless functions.
     * @param buffer File buffer from multer memoryStorage.
     * @param folder Target folder in Cloudinary.
     * @returns The secure URL of the uploaded image.
     */
    uploadImageBuffer(buffer: Buffer, folder?: string): Promise<string>;
    /**
     * Delete an image file from Cloudinary using its public ID or full URL.
     * @param imageUrl Full Cloudinary URL or Public ID of the image.
     */
    deleteImage(imageUrl: string): Promise<void>;
}
export declare const cloudinaryService: CloudinaryService;
export {};
//# sourceMappingURL=cloudinary.service.d.ts.map