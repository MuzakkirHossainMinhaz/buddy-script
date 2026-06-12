import { z } from 'zod';
export const PaginationQuerySchema = z.object({
    page: z.coerce.number().int().positive('Page must be a positive integer').default(1),
    limit: z.coerce.number().int().positive('Limit must be a positive integer').max(100, 'Limit cannot exceed 100').default(20),
    sort: z.enum(['newest', 'oldest']).default('newest'),
    cursor: z.string().min(1).optional(),
});
//# sourceMappingURL=pagination.schema.js.map