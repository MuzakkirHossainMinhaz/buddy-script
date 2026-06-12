import { prisma } from '../config/database.js';
import { logger } from '../config/logger.config.js';
import type { LikeTargetType } from '../generated/enums.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
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

export class CommentService {
  /**
   * Paginated comments for a given post.
   *
   * Each comment includes up to 3 of its earliest replies so the client
   * can render a preview without a second round-trip.
   *
   * @throws {NotFoundError} if the post doesn't exist, is deleted, or is
   *                         private and not owned by the caller
   */
  async getCommentsByPost(
    postUuid: string,
    limit: number,
    sort: SortOrder,
    cursor?: string,
    currentUserId?: bigint,
  ) {
    const post = await visibilityService.getVisiblePostByUuid(postUuid, currentUserId);

    const orderBy = sort === 'oldest' ? 'asc' : 'desc';
    const parsedCursor = await parseKeysetCursor(cursor, 'comment');

    const results = await prisma.comment.findMany({
      where: {
        postId: post.id,
        isDeleted: false,
        ...keysetWhere(sort, parsedCursor),
      },
      include: {
        user: { select: authorSelect },
        replies: {
          where: { isDeleted: false },
          take: 3,
          orderBy: { createdAt: 'asc' },
          include: { user: { select: authorSelect } },
        },
      },
      orderBy: [{ createdAt: orderBy }, { id: orderBy }],
      take: limit + 1,
    });

    const comments = results.slice(0, limit);
    const nextCursor = results.length > limit ? encodeKeysetCursor(comments.at(-1)) : null;
    const commentsWithLike = await this.attachIsLikedByMe(
      comments,
      'comment',
      currentUserId,
    );

    return { comments: commentsWithLike, nextCursor };
  }

  /**
   * Add a comment to a post.
   *
   * Runs inside a transaction so the post's `commentCount` stays in sync
   * with the actual number of non-deleted comments.
   *
   * @throws {NotFoundError} if the post doesn't exist, is deleted, or
   *                         is private and not owned by the caller
   */
  async createComment(
    postUuid: string,
    userId: bigint,
    content: string,
  ) {
    const post = await visibilityService.getVisiblePostByUuid(postUuid, userId);

    const sanitized = sanitizeContent(content);

    const comment = await prisma.$transaction(async (tx: any) => {
      const created = await tx.comment.create({
        data: {
          postId: post.id,
          userId,
          content: sanitized,
        },
        include: { user: { select: authorSelect } },
      });

      await tx.post.update({
        where: { id: post.id },
        data: { commentCount: { increment: 1 } },
      });

      await outboxService.enqueue('comment.created', created.id, {
        commentId: created.id.toString(),
        postId: post.id.toString(),
        userId: userId.toString(),
      }, tx);

      return created;
    });

    logger.info('Comment created', {
      commentId: comment.id.toString(),
      postId: post.id.toString(),
    });

    return comment;
  }

  /**
   * Update the content of a comment. Only the author may update.
   *
   * @throws {NotFoundError}  if the comment doesn't exist or is deleted
   * @throws {ForbiddenError} if the caller is not the author
   */
  async updateComment(
    commentUuid: string,
    userId: bigint,
    content: string,
  ) {
    const comment = await visibilityService.getVisibleCommentByUuid(commentUuid, userId);
    if (comment.userId !== userId) {
      throw new ForbiddenError('You can only update your own comments');
    }

    const sanitized = sanitizeContent(content);

    const updated = await prisma.comment.update({
      where: { id: comment.id },
      data: { content: sanitized },
      include: { user: { select: authorSelect } },
    });

    logger.info('Comment updated', { commentId: comment.id.toString() });
    return updated;
  }

  /**
   * Soft-delete a comment and decrement the parent post's `commentCount`.
   *
   * @throws {NotFoundError}  if the comment doesn't exist or is already deleted
   * @throws {ForbiddenError} if the caller is not the author
   */
  async deleteComment(commentUuid: string, userId: bigint) {
    const comment = await visibilityService.getVisibleCommentByUuid(commentUuid, userId);
    if (comment.userId !== userId) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.comment.update({
        where: { id: comment.id },
        data: { isDeleted: true },
      });

      await tx.post.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } },
      });

      await outboxService.enqueue('comment.deleted', comment.id, {
        commentId: comment.id.toString(),
        postId: comment.postId.toString(),
        userId: userId.toString(),
      }, tx);
    });

    logger.info('Comment soft-deleted', { commentId: comment.id.toString() });
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

export const commentService = new CommentService();
