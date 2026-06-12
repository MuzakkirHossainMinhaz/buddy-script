import { prisma } from '../config/database.js';
import { logger } from '../config/logger.config.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';
import { visibilityService } from './visibility.service.js';
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
    async likeTarget(userId, targetType, targetUuid) {
        const { targetId } = await this.resolveTarget(targetType, targetUuid, userId);
        const existing = await prisma.like.findUnique({
            where: {
                userId_targetType_targetId: { userId, targetType, targetId },
            },
        });
        if (existing) {
            throw new ConflictError('Already liked');
        }
        const newCount = await prisma.$transaction(async (tx) => {
            await tx.like.create({
                data: { userId, targetType, targetId },
            });
            const count = await this.incrementLikeCount(tx, targetType, targetId);
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
    async unlikeTarget(userId, targetType, targetUuid) {
        const { targetId } = await this.resolveTarget(targetType, targetUuid, userId);
        const existing = await prisma.like.findUnique({
            where: {
                userId_targetType_targetId: { userId, targetType, targetId },
            },
        });
        if (!existing) {
            throw new NotFoundError('Like');
        }
        const newCount = await prisma.$transaction(async (tx) => {
            await tx.like.delete({
                where: {
                    userId_targetType_targetId: { userId, targetType, targetId },
                },
            });
            const count = await this.decrementLikeCount(tx, targetType, targetId);
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
    async getLikers(targetType, targetUuid, limit, cursor, currentUserId) {
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
        const users = likes.map((like) => like.user);
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
    async resolveTarget(targetType, uuid, currentUserId) {
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
                const _exhaustive = targetType;
                throw new NotFoundError(`Unknown target type: ${String(_exhaustive)}`);
            }
        }
    }
    parseLikeCursor(cursor) {
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
    async incrementLikeCount(tx, targetType, targetId) {
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
                const _exhaustive = targetType;
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
    async decrementLikeCount(tx, targetType, targetId) {
        switch (targetType) {
            case 'post': {
                const current = await tx.post.findUniqueOrThrow({
                    where: { id: targetId },
                    select: { likeCount: true },
                });
                const decrementData = current.likeCount > 0
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
                const decrementData = current.likeCount > 0
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
                const decrementData = current.likeCount > 0
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
                const _exhaustive = targetType;
                throw new NotFoundError(`Unknown target type: ${String(_exhaustive)}`);
            }
        }
    }
}
export const likeService = new LikeService();
//# sourceMappingURL=like.service.js.map