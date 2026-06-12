import { z } from 'zod';
export declare const PaginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sort: z.ZodDefault<z.ZodEnum<{
        newest: "newest";
        oldest: "oldest";
    }>>;
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
//# sourceMappingURL=pagination.schema.d.ts.map