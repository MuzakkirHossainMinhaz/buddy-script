import { prisma } from '../config/database.js';
import { logger } from '../config/logger.config.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import { sanitizeContent } from '../utils/helpers.js';
import { visibilityService } from './visibility.service.js';
/** Minimal author shape included with every post. */
const authorSelect = {
    id: true,
    uuid: true,
    firstName: true,
    lastName: true,
};
export class PostService {
    /**
     * Paginated feed of all public, non-deleted posts.
     *
     * When `currentUserId` is provided each post carries an `isLikedByMe` flag
     * resolved via a single batched query against the polymorphic Like table.
     */
    async getPublicFeed(limit, sort, cursor, currentUserId) {
        const orderBy = sort === 'oldest' ? 'asc' : 'desc';
        const results = await prisma.post.findMany({
            where: { privacyType: 'public', isDeleted: false },
            include: { user: { select: authorSelect } },
            orderBy: [{ createdAt: orderBy }, { id: orderBy }],
            cursor: cursor ? { uuid: cursor } : undefined,
            skip: cursor ? 1 : 0,
            take: limit + 1,
        });
        const posts = results.slice(0, limit);
        const nextCursor = results.length > limit ? posts.at(-1)?.uuid ?? null : null;
        const postsWithLike = await this.attachIsLikedByMe(posts, 'post', currentUserId);
        return { posts: postsWithLike, nextCursor };
    }
    /**
     * Paginated list of the authenticated user's own posts (public + private).
     */
    async getMyPosts(userId, limit, sort, cursor) {
        const orderBy = sort === 'oldest' ? 'asc' : 'desc';
        const results = await prisma.post.findMany({
            where: { userId, isDeleted: false },
            include: { user: { select: authorSelect } },
            orderBy: [{ createdAt: orderBy }, { id: orderBy }],
            cursor: cursor ? { uuid: cursor } : undefined,
            skip: cursor ? 1 : 0,
            take: limit + 1,
        });
        const posts = results.slice(0, limit);
        const nextCursor = results.length > limit ? posts.at(-1)?.uuid ?? null : null;
        const postsWithLike = await this.attachIsLikedByMe(posts, 'post', userId);
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
    async getPostByUuid(postUuid, currentUserId) {
        const post = await visibilityService.getVisiblePostByUuid(postUuid, currentUserId);
        const isLikedByMe = currentUserId
            ? await this.checkSingleLike(currentUserId, 'post', post.id)
            : false;
        return { ...post, isLikedByMe };
    }
    /**
     * Create a new post for the given user.
     * Content is sanitized before persisting.
     */
    async createPost(userId, data) {
        const sanitized = sanitizeContent(data.content);
        const post = await prisma.post.create({
            data: {
                userId,
                content: sanitized,
                imageUrl: data.imageUrl,
                privacyType: data.privacyType,
            },
            include: { user: { select: authorSelect } },
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
    async updatePost(postUuid, userId, data) {
        const post = await prisma.post.findUnique({ where: { uuid: postUuid } });
        if (!post || post.isDeleted) {
            throw new NotFoundError('Post');
        }
        if (post.userId !== userId) {
            throw new ForbiddenError('You can only update your own posts');
        }
        const updateData = {};
        if (data.content !== undefined) {
            updateData.content = sanitizeContent(data.content);
        }
        if (data.privacyType !== undefined) {
            updateData.privacyType = data.privacyType;
        }
        const updated = await prisma.post.update({
            where: { id: post.id },
            data: updateData,
            include: { user: { select: authorSelect } },
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
    async deletePost(postUuid, userId) {
        const post = await prisma.post.findUnique({ where: { uuid: postUuid } });
        if (!post || post.isDeleted) {
            throw new NotFoundError('Post');
        }
        if (post.userId !== userId) {
            throw new ForbiddenError('You can only delete your own posts');
        }
        await prisma.post.update({
            where: { id: post.id },
            data: { isDeleted: true },
        });
        logger.info('Post soft-deleted', { postId: post.id.toString() });
    }
    // Private Helpers Functions
    /**
     * Attach an `isLikedByMe` boolean to every item in a list.
     *
     * Performs a single `findMany` query against the polymorphic Like table
     * to determine which target IDs the current user has liked, then maps
     * the flag onto each item.
     */
    async attachIsLikedByMe(items, targetType, currentUserId) {
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
        const likedSet = new Set(likes.map((l) => l.targetId));
        return items.map((item) => ({
            ...item,
            isLikedByMe: likedSet.has(item.id),
        }));
    }
    /**
     * Check whether a single target has been liked by the given user.
     */
    async checkSingleLike(userId, targetType, targetId) {
        const like = await prisma.like.findUnique({
            where: {
                userId_targetType_targetId: { userId, targetType, targetId },
            },
        });
        return like !== null;
    }
}
export const postService = new PostService();
//# sourceMappingURL=post.service.js.map