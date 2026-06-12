import { prisma } from '../config/database.js';
import { logger } from '../config/logger.config.js';
import type { LikeTargetType } from '../generated/enums.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';
import { outboxService } from './outbox.service.js';
import { visibilityService } from './visibility.service.js';

type TargetType = LikeTargetType;

interface ResolvedTarget {
  targetId: bigint;
  currentLikeCount: bigint;
}

/**
 * Prisma interactive-transaction client type.
 *
 * Extracted from `prisma.$transaction` to strongly type the `tx` parameter
 * without resorting to `any`.
 */
type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export class LikeService {
  /**
   * Like a post, comment, or reply.
   *
   * Resolves the public UUID to an internal BigInt ID, creates a like
   * record, and increments the target's `likeCount` — all within a
   * single transaction.
   *
   * @throws {NotFoundError}  if the target doesn't exist or is deleted
   * @throws {ConflictError}  if the user has already liked this target
   */
  async likeTarget(
    userId: bigint,
    targetType: TargetType,
    targetUuid: string,
  ) {
    const { targetId } = await this.resolveTarget(targetType, targetUuid, userId);

    const existing = await prisma.like.findUnique({
      where: {
        userId_targetType_targetId: { userId, targetType, targetId },
      },
    });

    if (existing) {
      throw new ConflictError('Already liked');
    }

    const newCount = await prisma.$transaction(async (tx: any) => {
      await tx.like.create({
        data: { userId, targetType, targetId },
      });

      const count = await this.incrementLikeCount(tx, targetType, targetId);
      await outboxService.enqueue('like.created', targetId, {
        userId: userId.toString(),
        targetType,
        targetId: targetId.toString(),
      }, tx);
      return count;
    });

    logger.info('Target liked', {
      userId: userId.toString(),
      targetType,
      targetId: targetId.toString(),
    });

    return { liked: true, likeCount: newCount };
  }

  /**
   * Remove a like from a post, comment, or reply.
   *
   * @throws {NotFoundError} if the target doesn't exist or the like record
   *                         doesn't exist (can't unlike something you haven't liked)
   */
  async unlikeTarget(
    userId: bigint,
    targetType: TargetType,
    targetUuid: string,
  ) {
    const { targetId } = await this.resolveTarget(targetType, targetUuid, userId);

    const existing = await prisma.like.findUnique({
      where: {
        userId_targetType_targetId: { userId, targetType, targetId },
      },
    });

    if (!existing) {
      throw new NotFoundError('Like');
    }

    const newCount = await prisma.$transaction(async (tx: any) => {
      await tx.like.delete({
        where: {
          userId_targetType_targetId: { userId, targetType, targetId },
        },
      });

      const count = await this.decrementLikeCount(tx, targetType, targetId);
      await outboxService.enqueue('like.deleted', targetId, {
        userId: userId.toString(),
        targetType,
        targetId: targetId.toString(),
      }, tx);
      return count;
    });

    logger.info('Target unliked', {
      userId: userId.toString(),
      targetType,
      targetId: targetId.toString(),
    });

    return { liked: false, likeCount: newCount };
  }

  /**
   * Paginated list of users who liked a given target.
   *
   * @throws {NotFoundError} if the target doesn't exist or is deleted
   */
  async getLikers(
    targetType: TargetType,
    targetUuid: string,
    limit: number,
    cursor?: string,
    currentUserId?: bigint,
  ) {
    const { targetId } = await this.resolveTarget(targetType, targetUuid, currentUserId);
    const cursorId = this.parseLikeCursor(cursor);

    const results = await prisma.like.findMany({
      where: { targetType, targetId },
      include: {
        user: {
          select: {
            id: true,
            uuid: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      cursor: cursorId ? { id: cursorId } : undefined,
      skip: cursorId ? 1 : 0,
      take: limit + 1,
    });

    const likes = results.slice(0, limit);
    const nextCursor = results.length > limit ? likes.at(-1)?.id.toString() ?? null : null;
    const users = likes.map((like: any) => like.user);

    return { users, nextCursor };
  }

  // Private Helpers

  /**
   * Resolve a target's public UUID to its internal BigInt ID and current
   * like count.
   *
   * Each target type is handled independently because the Like model is
   * polymorphic (no FK relations to Post/Comment/Reply).
   *
   * @throws {NotFoundError} if the target doesn't exist or is soft-deleted
   */
  private async resolveTarget(
    targetType: TargetType,
    uuid: string,
    currentUserId?: bigint,
  ): Promise<ResolvedTarget> {
    switch (targetType) {
      case 'post': {
        const post = await visibilityService.getVisiblePostByUuid(uuid, currentUserId);
        return { targetId: post.id, currentLikeCount: BigInt(post.likeCount) };
      }
      case 'comment': {
        const comment = await visibilityService.getVisibleCommentByUuid(uuid, currentUserId);
        return {
          targetId: comment.id,
          currentLikeCount: BigInt(comment.likeCount),
        };
      }
      case 'reply': {
        const reply = await visibilityService.getVisibleReplyByUuid(uuid, currentUserId);
        return {
          targetId: reply.id,
          currentLikeCount: BigInt(reply.likeCount),
        };
      }
      default: {
        const _exhaustive: never = targetType;
        throw new NotFoundError(`Unknown target type: ${String(_exhaustive)}`);
      }
    }
  }

  private parseLikeCursor(cursor?: string): bigint | undefined {
    if (!cursor) {
      return undefined;
    }

    if (!/^\d+$/.test(cursor)) {
      throw new ValidationError('Invalid like cursor');
    }

    return BigInt(cursor);
  }

  /**
   * Increment `likeCount` on the target model and return the new count.
   */
  private async incrementLikeCount(
    tx: TransactionClient,
    targetType: TargetType,
    targetId: bigint,
  ): Promise<bigint> {
    if (process.env.COUNTER_WRITE_MODE === 'buffered') {
      const current = await this.getCurrentLikeCount(tx, targetType, targetId);
      await this.enqueueCounterDelta(tx, targetType, targetId, 'like_count', 1);
      return current + 1n;
    }

    switch (targetType) {
      case 'post': {
        const p = await tx.post.update({
          where: { id: targetId },
          data: { likeCount: { increment: 1 } },
          select: { likeCount: true },
        });
        return BigInt(p.likeCount);
      }
      case 'comment': {
        const c = await tx.comment.update({
          where: { id: targetId },
          data: { likeCount: { increment: 1 } },
          select: { likeCount: true },
        });
        return BigInt(c.likeCount);
      }
      case 'reply': {
        const r = await tx.reply.update({
          where: { id: targetId },
          data: { likeCount: { increment: 1 } },
          select: { likeCount: true },
        });
        return BigInt(r.likeCount);
      }
      default: {
        const _exhaustive: never = targetType;
        throw new NotFoundError(`Unknown target type: ${String(_exhaustive)}`);
      }
    }
  }

  /**
   * Decrement `likeCount` on the target model (floored at 0) and return
   * the new count.
   *
   * Reads the current count first to avoid negative values from race
   * conditions or stale data.
   */
  private async decrementLikeCount(
    tx: TransactionClient,
    targetType: TargetType,
    targetId: bigint,
  ): Promise<bigint> {
    if (process.env.COUNTER_WRITE_MODE === 'buffered') {
      const current = await this.getCurrentLikeCount(tx, targetType, targetId);
      await this.enqueueCounterDelta(tx, targetType, targetId, 'like_count', -1);
      return current > 0n ? current - 1n : 0n;
    }

    switch (targetType) {
      case 'post': {
        const current = await tx.post.findUniqueOrThrow({
          where: { id: targetId },
          select: { likeCount: true },
        });
        const decrementData =
          current.likeCount > 0
            ? { decrement: 1 }
            : current.likeCount;
        const p = await tx.post.update({
          where: { id: targetId },
          data: { likeCount: decrementData },
          select: { likeCount: true },
        });
        return BigInt(p.likeCount);
      }
      case 'comment': {
        const current = await tx.comment.findUniqueOrThrow({
          where: { id: targetId },
          select: { likeCount: true },
        });
        const decrementData =
          current.likeCount > 0
            ? { decrement: 1 }
            : current.likeCount;
        const c = await tx.comment.update({
          where: { id: targetId },
          data: { likeCount: decrementData },
          select: { likeCount: true },
        });
        return BigInt(c.likeCount);
      }
      case 'reply': {
        const current = await tx.reply.findUniqueOrThrow({
          where: { id: targetId },
          select: { likeCount: true },
        });
        const decrementData =
          current.likeCount > 0
            ? { decrement: 1 }
            : current.likeCount;
        const r = await tx.reply.update({
          where: { id: targetId },
          data: { likeCount: decrementData },
          select: { likeCount: true },
        });
        return BigInt(r.likeCount);
      }
      default: {
        const _exhaustive: never = targetType;
        throw new NotFoundError(`Unknown target type: ${String(_exhaustive)}`);
      }
    }
  }

  private async getCurrentLikeCount(
    tx: TransactionClient,
    targetType: TargetType,
    targetId: bigint,
  ): Promise<bigint> {
    switch (targetType) {
      case 'post': {
        const post = await tx.post.findUniqueOrThrow({
          where: { id: targetId },
          select: { likeCount: true },
        });
        return BigInt(post.likeCount);
      }
      case 'comment': {
        const comment = await tx.comment.findUniqueOrThrow({
          where: { id: targetId },
          select: { likeCount: true },
        });
        return BigInt(comment.likeCount);
      }
      case 'reply': {
        const reply = await tx.reply.findUniqueOrThrow({
          where: { id: targetId },
          select: { likeCount: true },
        });
        return BigInt(reply.likeCount);
      }
      default: {
        const _exhaustive: never = targetType;
        throw new NotFoundError(`Unknown target type: ${String(_exhaustive)}`);
      }
    }
  }

  private async enqueueCounterDelta(
    tx: TransactionClient,
    targetType: TargetType,
    targetId: bigint,
    fieldName: 'like_count',
    delta: 1 | -1,
  ): Promise<void> {
    await tx.$executeRaw`
      INSERT INTO counter_deltas (target_type, target_id, field_name, delta)
      VALUES (${targetType}, ${targetId}, ${fieldName}, ${delta})
    `;
  }
}

export const likeService = new LikeService();
