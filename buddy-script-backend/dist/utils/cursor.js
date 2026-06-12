import { prismaRead } from '../config/database.js';
import { ValidationError } from './errors.js';
export function encodeKeysetCursor(item) {
    if (!item) {
        return null;
    }
    return Buffer
        .from(JSON.stringify({ createdAt: item.createdAt.toISOString(), id: item.id.toString() }))
        .toString('base64url');
}
export async function parseKeysetCursor(cursor, legacyTable) {
    if (!cursor) {
        return null;
    }
    try {
        const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
        if (parsed.createdAt && parsed.id && /^\d+$/.test(parsed.id)) {
            const createdAt = new Date(parsed.createdAt);
            if (!Number.isNaN(createdAt.getTime())) {
                return { createdAt, id: BigInt(parsed.id) };
            }
        }
    }
    catch {
        // Accept older public UUID cursors so deployed clients keep working.
    }
    const legacyItem = await findLegacyCursorItem(legacyTable, cursor);
    if (!legacyItem) {
        throw new ValidationError('Invalid cursor');
    }
    return { createdAt: legacyItem.createdAt, id: legacyItem.id };
}
export function keysetWhere(sort, parsedCursor) {
    if (!parsedCursor) {
        return {};
    }
    return sort === 'oldest'
        ? {
            OR: [
                { createdAt: { gt: parsedCursor.createdAt } },
                { createdAt: parsedCursor.createdAt, id: { gt: parsedCursor.id } },
            ],
        }
        : {
            OR: [
                { createdAt: { lt: parsedCursor.createdAt } },
                { createdAt: parsedCursor.createdAt, id: { lt: parsedCursor.id } },
            ],
        };
}
async function findLegacyCursorItem(table, uuid) {
    const select = { createdAt: true, id: true };
    switch (table) {
        case 'post':
            return prismaRead.post.findUnique({ where: { uuid }, select });
        case 'comment':
            return prismaRead.comment.findUnique({ where: { uuid }, select });
        case 'reply':
            return prismaRead.reply.findUnique({ where: { uuid }, select });
        default: {
            const _exhaustive = table;
            throw new ValidationError(`Unsupported cursor table: ${String(_exhaustive)}`);
        }
    }
}
//# sourceMappingURL=cursor.js.map