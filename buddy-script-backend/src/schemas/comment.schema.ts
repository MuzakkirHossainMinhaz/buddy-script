import { z } from 'zod';

export const CreateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Content is required')
    .max(2000, 'Content must not exceed 2000 characters'),
});

export const UpdateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Content must be at least 1 character')
    .max(2000, 'Content must not exceed 2000 characters'),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;
