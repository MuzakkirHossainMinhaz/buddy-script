import { prisma } from '../config/database.js';
/**
 * Durable event outbox for high-volume side effects.
 *
 * Request handlers write the business row and an outbox event in the same
 * transaction where practical. A production worker can consume this table for
 * fanout feeds, notifications, analytics, search indexing, and cache warming.
 */
export class OutboxService {
    async enqueue(eventName, aggregateId, payload, client = prisma) {
        await client.$executeRaw `
      INSERT INTO outbox_events (event_name, aggregate_id, payload)
      VALUES (${eventName}, ${aggregateId}, ${JSON.stringify(payload)}::jsonb)
    `;
    }
}
export const outboxService = new OutboxService();
//# sourceMappingURL=outbox.service.js.map