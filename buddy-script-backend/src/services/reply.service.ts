import { prisma } from '../config/database.js';
import { logger } from '../config/logger.config.js';
import type { LikeTargetType } from '../generated/enums.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.js';
import { sanitizeContent } from '../utils/helpers.js';
import {
  encodeKeysetCursor,
  keysetWhere,
  parseKeysetCursor,
  type SortOrder,
} from '../utils/cursor.js';
import { visibilityService } from './visibility.service.js';
import { outboxService } from './outbox.service.js';

const authorSelect = {
  id: true,
  uuid: true,
  firstName: true,
  lastName: true,
} as const;

export class ReplyService {
  /**
   * Paginated replies for a given comment.
   *
   * @throws {NotFoundError} if the comment doesn't exist or is deleted
   */
  async getRepliesByComment(
    commentUuid: string,
    limit: number,
    sort: SortOrder,
    cursor?: string,
    currentUserId?: bigint,
  ) {
    const comment = await visibilityService.getVisibleCommentByUuid(commentUuid, currentUserId);

    const orderBy = sort === 'oldest' ? 'asc' : 'desc';
    const parsedCursor = await parseKeysetCursor(cursor, 'reply');

    const results = await prisma.reply.findMany({
      where: {
        commentId: comment.id,
        isDeleted: false,
        ...keysetWhere(sort, parsedCursor),
      },
      include: {
        user: { select: authorSelect },
        parentReply: { select: { uuid: true } },
      },
      orderBy: [{ createdAt: orderBy }, { id: orderBy }],
      take: limit + 1,
    });

    const replies = results.slice(0, limit);
    const nextCursor = results.length > limit ? encodeKeysetCursor(replies.at(-1)) : null;
    const repliesWithLike = await this.attachIsLikedByMe(
      replies,
      'reply',
      currentUserId,
    );

    return { replies: repliesWithLike, nextCursor };
  }

  /**
   * Create a reply on a comment, optionally nested under a parent reply.
   *
   * Runs inside a transaction so the comment's `replyCount` stays in sync.
   *
   * @param commentUuid    - UUID of the comment being replied to
   * @param userId         - BigInt ID of the replying user
   * @param content        - Raw reply text (will be sanitized)
   * @param parentReplyUuid - Optional UUID of a parent reply for nesting
   *
   * @throws {NotFoundError} if the comment or parent reply doesn't exist / is deleted
   */
  async createReply(
    commentUuid: string,
    userId: bigint,
    content: string,
    parentReplyUuid?: string,
  ) {
    const comment = await visibilityService.getVisibleCommentByUuid(commentUuid, userId);

    let parentReplyId: bigint | null = null;

    if (parentReplyUuid) {
      const parentReply = await visibilityService.getVisibleReplyByUuid(parentReplyUuid, userId);

      if (parentReply.commentId !== comment.id) {
        throw new NotFoundError('Parent reply');
      }

      if (parentReply.parentReplyId !== null) {
        throw new ValidationError('Maximum reply depth of 3 layers reached');
      }

      parentReplyId = parentReply.id;
    }

    const sanitized = sanitizeContent(content);

    const reply = await prisma.$transaction(async (tx: any) => {
      const created = await tx.reply.create({
        data: {
          commentId: comment.id,
          userId,
          content: sanitized,
          parentReplyId,
        },
        include: {
          user: { select: authorSelect },
          parentReply: { select: { uuid: true } },
        },
      });

      await tx.comment.update({
        where: { id: comment.id },
        data: { replyCount: { increment: 1 } },
      });

      await outboxService.enqueue('reply.created', created.id, {
        replyId: created.id.toString(),
        commentId: comment.id.toString(),
        userId: userId.toString(),
        parentReplyId: parentReplyId?.toString() ?? null,
      }, tx);

      return created;
    });

    logger.info('Reply created', {
      replyId: reply.id.toString(),
      commentId: comment.id.toString(),
    });

    return reply;
  }

  /**
   * Update the content of a reply. Only the author may update.
   *
   * @throws {NotFoundError}  if the reply doesn't exist or is deleted
   * @throws {ForbiddenError} if the caller is not the author
   */
  async updateReply(
    replyUuid: string,
    userId: bigint,
    content: string,
  ) {
    const reply = await visibilityService.getVisibleReplyByUuid(replyUuid, userId);
    if (reply.userId !== userId) {
      throw new ForbiddenError('You can only update your own replies');
    }

    const sanitized = sanitizeContent(content);

    const updated = await prisma.reply.update({
      where: { id: reply.id },
      data: { content: sanitized },
      include: {
        user: { select: authorSelect },
        parentReply: { select: { uuid: true } },
      },
    });

    logger.info('Reply updated', { replyId: reply.id.toString() });
    return updated;
  }

  /**
   * Soft-delete a reply and decrement the parent comment's `replyCount`.
   *
   * @throws {NotFoundError}  if the reply doesn't exist or is already deleted
   * @throws {ForbiddenError} if the caller is not the author
   */
  async deleteReply(replyUuid: string, userId: bigint) {
    const reply = await visibilityService.getVisibleReplyByUuid(replyUuid, userId);
    if (reply.userId !== userId) {
      throw new ForbiddenError('You can only delete your own replies');
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.reply.update({
        where: { id: reply.id },
        data: { isDeleted: true },
      });

      await tx.comment.update({
        where: { id: reply.commentId },
        data: { replyCount: { decrement: 1 } },
      });

      await outboxService.enqueue('reply.deleted', reply.id, {
        replyId: reply.id.toString(),
        commentId: reply.commentId.toString(),
        userId: userId.toString(),
      }, tx);
    });

    logger.info('Reply soft-deleted', { replyId: reply.id.toString() });
  }

  // Private Helper Functions
  /**
   * Batch-check which items the current user has liked and attach
   * an `isLikedByMe` flag to each item.
   */
  private async attachIsLikedByMe<T extends { id: bigint }>(
    items: T[],
    targetType: LikeTargetType,
    currentUserId?: bigint,
  ): Promise<(T & { isLikedByMe: boolean })[]> {
    if (!currentUserId || items.length === 0) {
      return items.map((item) => ({ ...item, isLikedByMe: false }));
    }

    const targetIds = items.map((item) => item.id);

    const likes = await prisma.like.findMany({
      where: {
        userId: currentUserId,
        targetType,
        targetId: { in: targetIds },
      },
      select: { targetId: true },
    });

    const likedSet = new Set(likes.map((l: any) => l.targetId));

    return items.map((item) => ({
      ...item,
      isLikedByMe: likedSet.has(item.id),
    }));
  }
}

export const replyService = new ReplyService();
