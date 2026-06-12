import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { ValidationError } from '../utils/errors.js';
const isProduction = process.env.NODE_ENV === 'production';
export const uploadsDir = isProduction
    ? '/tmp/buddy-script-uploads'
    : path.join(process.cwd(), 'src', 'uploads');
if (!isProduction) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
// Use memory storage for stateless cloud environment (Vercel compatibility)
const storage = multer.memoryStorage();
export const uploadPostImage = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },
    fileFilter: (_req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            cb(new ValidationError('Image must be a JPEG, PNG, WEBP, or GIF file'));
            return;
        }
        cb(null, true);
    },
});
//# sourceMappingURL=upload.middleware.js.map