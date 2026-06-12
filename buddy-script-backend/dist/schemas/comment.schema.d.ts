import { z } from 'zod';
export declare const CreateCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
export declare const UpdateCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;
//# sourceMappingURL=comment.schema.d.ts.map