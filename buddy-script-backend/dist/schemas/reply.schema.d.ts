import { z } from 'zod';
export declare const CreateReplySchema: z.ZodObject<{
    content: z.ZodString;
    parentReplyId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const UpdateReplySchema: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
export type CreateReplyInput = z.infer<typeof CreateReplySchema>;
export type UpdateReplyInput = z.infer<typeof UpdateReplySchema>;
//# sourceMappingURL=reply.schema.d.ts.map