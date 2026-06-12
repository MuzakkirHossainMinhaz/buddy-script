import { prisma } from '../config/database.js';
type OutboxEventName = 'post.created' | 'post.updated' | 'post.deleted' | 'comment.created' | 'comment.deleted' | 'reply.created' | 'reply.deleted' | 'like.created' | 'like.deleted';
/**
 * Durable event outbox for high-volume side effects.
 *
 * Request handlers write the business row and an outbox event in the same
 * transaction where practical. A production worker can consume this table for
 * fanout feeds, notifications, analytics, search indexing, and cache warming.
 */
export declare class OutboxService {
    enqueue(eventName: OutboxEventName, aggregateId: bigint, payload: Record<string, unknown>, client?: Pick<typeof prisma, '$executeRaw'>): Promise<void>;
}
export declare const outboxService: OutboxService;
export {};
//# sourceMappingURL=outbox.service.d.ts.map