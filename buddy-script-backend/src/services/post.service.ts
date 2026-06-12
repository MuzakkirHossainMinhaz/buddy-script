import { prisma, prismaRead } from '../config/database.js';
import { logger } from '../config/logger.config.js';
import type { LikeTargetType, PostPrivacy } from '../generated/enums.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import { sanitizeContent } from '../utils/helpers.js';
import {
  encodeKeysetCursor,
  keysetWhere,
  parseKeysetCursor,
  type SortOrder,
} from '../utils/cursor.js';
import { cacheService } from './cache.service.js';
import { outboxService } from './outbox.service.js';
import { visibilityService } from './visibility.service.js';

const PUBLIC_FEED_CACHE_TTL_SECONDS = parseInt(process.env.FEED_CACHE_TTL_SECONDS || '30', 10);
const PUBLIC_FEED_CACHE_NAMESPACE = 'feed:public';

/** Minimal author shape included with every post. */
const authorSelect = {
  id: true,
  uuid: true,
  firstName: true,
  lastName: true,
} as const;

export class PostService {
  /**
   * Paginated feed of all public, non-deleted posts.
   *
   * When `currentUserId` is provided each post carries an `isLikedByMe` flag
   * resolved via a single batched query against the polymorphic Like table.
   */
  async getPublicFeed(
    limit: number,
    sort: SortOrder,
    cursor?: string,
    currentUserId?: bigint,
  ) {
    const orderBy = sort === 'oldest' ? 'asc' : 'desc';
    const parsedCursor = await parseKeysetCursor(cursor, 'post');
    const cacheVersion = await cacheService.getNamespaceVersion(PUBLIC_FEED_CACHE_NAMESPACE);
    const cacheKey = `${PUBLIC_FEED_CACHE_NAMESPACE}:v${cacheVersion}:${sort}:${limit}:${cursor ?? 'first'}`;

    const results = await cacheService.getOrSet(cacheKey, PUBLIC_FEED_CACHE_TTL_SECONDS, () =>
      prismaRead.post.findMany({
        where: {
          privacyType: 'public',
          isDeleted: false,
          ...keysetWhere(sort, parsedCursor),
        },
        include: { user: { select: authorSelect } },
        orderBy: [{ createdAt: orderBy }, { id: orderBy }],
        take: limit + 1,
      }),
    );

    const normalizedResults = results.map((post: any) => this.normalizeCachedPost(post));
    const posts = normalizedResults.slice(0, limit);
    const nextCursor = normalizedResults.length > limit ? encodeKeysetCursor(posts.at(-1)) : null;
    const postsWithLike = await this.attachIsLikedByMe(
      posts,
      'post',
      currentUserId,
    );

    return { posts: postsWithLike, nextCursor };
  }

  /**
   * Paginated list of the authenticated user's own posts (public + private).
   */
  async getMyPosts(
    userId: bigint,
    limit: number,
    sort: SortOrder,
    cursor?: string,
  ) {
    const orderBy = sort === 'oldest' ? 'asc' : 'desc';
    const parsedCursor = await parseKeysetCursor(cursor, 'post');

    const results = await prismaRead.post.findMany({
      where: {
        userId,
        isDeleted: false,
        ...keysetWhere(sort, parsedCursor),
      },
      include: { user: { select: authorSelect } },
      orderBy: [{ createdAt: orderBy }, { id: orderBy }],
      take: limit + 1,
    });

    const posts = results.slice(0, limit);
    const nextCursor = results.length > limit ? encodeKeysetCursor(posts.at(-1)) : null;
    const postsWithLike = await this.attachIsLikedByMe(
      posts,
      'post',
      userId,
    );

    return { posts: postsWithLike, nextCursor };
  }

  /**
   * Fetch a single post by its public UUID.
   *
   * Private posts are only visible to their author; for everyone else
   * a {@link NotFoundError} is thrown so we don't leak the post's existence.
   *
   * @throws {NotFoundError} if the post doesn't exist, is deleted,
   *                         or is private and not owned by the caller
   */
  async getPostByUuid(postUuid: string, currentUserId?: bigint) {
    const post = await visibilityService.getVisiblePostByUuid(postUuid, currentUserId);

    const isLikedByMe = currentUserId
      ? await this.checkSingleLike(currentUserId, 'post', post.id)
      : false;

    return { ...post, isLikedByMe };
  }

  async invalidatePublicFeedCache(): Promise<void> {
    await cacheService.bumpNamespaceVersion(PUBLIC_FEED_CACHE_NAMESPACE);
  }

  /**
   * Create a new post for the given user.
   * Content is sanitized before persisting.
   */
  async createPost(
    userId: bigint,
    data: { content: string; imageUrl?: string; privacyType: PostPrivacy },
  ) {
    const sanitized = sanitizeContent(data.content);

    const post = await prisma.$transaction(async (tx: any) => {
      const created = await tx.post.create({
        data: {
          userId,
          content: sanitized,
          imageUrl: data.imageUrl,
          privacyType: data.privacyType,
        },
        include: { user: { select: authorSelect } },
      });

      await outboxService.enqueue('post.created', created.id, {
        postId: created.id.toString(),
        userId: userId.toString(),
        privacyType: created.privacyType,
      }, tx);

      return created;
    });

    logger.info('Post created', {
      postId: post.id.toString(),
      userId: userId.toString(),
    });

    return post;
  }

  /**
   * Update an existing post. Only the author may update.
   *
   * @throws {NotFoundError}  if the post doesn't exist or is deleted
   * @throws {ForbiddenError} if the caller is not the author
   */
  async updatePost(
    postUuid: string,
    userId: bigint,
    data: { content?: string; privacyType?: PostPrivacy },
  ) {
    const post = await prisma.post.findUnique({ where: { uuid: postUuid } });

    if (!post || post.isDeleted) {
      throw new NotFoundError('Post');
    }
    if (post.userId !== userId) {
      throw new ForbiddenError('You can only update your own posts');
    }

    const updateData: Record<string, unknown> = {};
    if (data.content !== undefined) {
      updateData.content = sanitizeContent(data.content);
    }
    if (data.privacyType !== undefined) {
      updateData.privacyType = data.privacyType;
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const result = await tx.post.update({
        where: { id: post.id },
        data: updateData,
        include: { user: { select: authorSelect } },
      });

      await outboxService.enqueue('post.updated', post.id, {
        postId: post.id.toString(),
        userId: userId.toString(),
        privacyType: result.privacyType,
      }, tx);

      return result;
    });

    logger.info('Post updated', { postId: post.id.toString() });
    return updated;
  }

  /**
   * Soft-delete a post. Only the author may delete.
   *
   * @throws {NotFoundError}  if the post doesn't exist or is already deleted
   * @throws {ForbiddenError} if the caller is not the author
   */
  async deletePost(postUuid: string, userId: bigint) {
    const post = await prisma.post.findUnique({ where: { uuid: postUuid } });

    if (!post || post.isDeleted) {
      throw new NotFoundError('Post');
    }
    if (post.userId !== userId) {
      throw new ForbiddenError('You can only delete your own posts');
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.post.update({
        where: { id: post.id },
        data: { isDeleted: true },
      });

      await outboxService.enqueue('post.deleted', post.id, {
        postId: post.id.toString(),
        userId: userId.toString(),
      }, tx);
    });

    logger.info('Post soft-deleted', { postId: post.id.toString() });
  }

  // Private Helpers Functions

  private normalizeCachedPost(post: any) {
    return {
      ...post,
      id: typeof post.id === 'bigint' ? post.id : BigInt(post.id),
      likeCount: typeof post.likeCount === 'bigint' ? post.likeCount : BigInt(post.likeCount),
      commentCount: typeof post.commentCount === 'bigint' ? post.commentCount : BigInt(post.commentCount),
      createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt),
      updatedAt: post.updatedAt instanceof Date ? post.updatedAt : new Date(post.updatedAt),
      user: {
        ...post.user,
        id: typeof post.user.id === 'bigint' ? post.user.id : BigInt(post.user.id),
      },
    };
  }

  /**
   * Attach an `isLikedByMe` boolean to every item in a list.
   *
   * Performs a single `findMany` query against the polymorphic Like table
   * to determine which target IDs the current user has liked, then maps
   * the flag onto each item.
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

  /**
   * Check whether a single target has been liked by the given user.
   */
  private async checkSingleLike(
    userId: bigint,
    targetType: LikeTargetType,
    targetId: bigint,
  ): Promise<boolean> {
    const like = await prisma.like.findUnique({
      where: {
        userId_targetType_targetId: { userId, targetType, targetId },
      },
    });
    return like !== null;
  }
}

export const postService = new PostService();
