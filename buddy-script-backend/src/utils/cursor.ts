import { prismaRead } from '../config/database.js';
import { ValidationError } from './errors.js';

export type SortOrder = 'newest' | 'oldest';
export type KeysetCursor = { createdAt: Date; id: bigint };

type LegacyLookupTable = 'post' | 'comment' | 'reply';

export function encodeKeysetCursor(item?: { createdAt: Date; id: bigint } | null): string | null {
  if (!item) {
    return null;
  }

  return Buffer
    .from(JSON.stringify({ createdAt: item.createdAt.toISOString(), id: item.id.toString() }))
    .toString('base64url');
}

export async function parseKeysetCursor(
  cursor: string | undefined,
  legacyTable: LegacyLookupTable,
): Promise<KeysetCursor | null> {
  if (!cursor) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as {
      createdAt?: string;
      id?: string;
    };

    if (parsed.createdAt && parsed.id && /^\d+$/.test(parsed.id)) {
      const createdAt = new Date(parsed.createdAt);
      if (!Number.isNaN(createdAt.getTime())) {
        return { createdAt, id: BigInt(parsed.id) };
      }
    }
  } catch {
    // Accept older public UUID cursors so deployed clients keep working.
  }

  const legacyItem = await findLegacyCursorItem(legacyTable, cursor);
  if (!legacyItem) {
    throw new ValidationError('Invalid cursor');
  }

  return { createdAt: legacyItem.createdAt, id: legacyItem.id };
}

export function keysetWhere(sort: SortOrder, parsedCursor: KeysetCursor | null) {
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

async function findLegacyCursorItem(table: LegacyLookupTable, uuid: string) {
  const select = { createdAt: true, id: true } as const;

  switch (table) {
    case 'post':
      return prismaRead.post.findUnique({ where: { uuid }, select });
    case 'comment':
      return prismaRead.comment.findUnique({ where: { uuid }, select });
    case 'reply':
      return prismaRead.reply.findUnique({ where: { uuid }, select });
    default: {
      const _exhaustive: never = table;
      throw new ValidationError(`Unsupported cursor table: ${String(_exhaustive)}`);
    }
  }
}
