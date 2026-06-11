import { z } from 'zod';

export const CreateReplySchema = z.object({
  content: z.string()
    .min(1, 'Content is required')
    .max(2000, 'Content must not exceed 2000 characters'),
  parentReplyId: z.string().uuid('Invalid parent reply ID').optional(),
});

export const UpdateReplySchema = z.object({
  content: z.string()
    .min(1, 'Content must be at least 1 character')
    .max(2000, 'Content must not exceed 2000 characters'),
});

export type CreateReplyInput = z.infer<typeof CreateReplySchema>;
export type UpdateReplyInput = z.infer<typeof UpdateReplySchema>;
