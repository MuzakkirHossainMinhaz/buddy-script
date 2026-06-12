import { z } from 'zod';
export declare const CreatePostSchema: z.ZodObject<{
    content: z.ZodDefault<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    privacyType: z.ZodDefault<z.ZodEnum<{
        public: "public";
        private: "private";
    }>>;
}, z.core.$strip>;
export declare const UpdatePostSchema: z.ZodObject<{
    content: z.ZodOptional<z.ZodString>;
    privacyType: z.ZodOptional<z.ZodEnum<{
        public: "public";
        private: "private";
    }>>;
}, z.core.$strip>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
//# sourceMappingURL=post.schema.d.ts.map