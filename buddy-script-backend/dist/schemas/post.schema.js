import { z } from 'zod';
export const CreatePostSchema = z.object({
    content: z.string()
        .max(5000, 'Content must not exceed 5000 characters')
        .default(''),
    imageUrl: z.string().url('Invalid image URL').optional(),
    privacyType: z.enum(['public', 'private']).default('public'),
});
export const UpdatePostSchema = z.object({
    content: z.string()
        .min(1, 'Content must be at least 1 character')
        .max(5000, 'Content must not exceed 5000 characters')
        .optional(),
    privacyType: z.enum(['public', 'private']).optional(),
});
//# sourceMappingURL=post.schema.js.map