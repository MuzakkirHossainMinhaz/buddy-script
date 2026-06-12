import type { PostPrivacy } from '../generated/enums.js';
import { type SortOrder } from '../utils/cursor.js';
export declare class PostService {
    /**
     * Paginated feed of all public, non-deleted posts.
     *
     * When `currentUserId` is provided each post carries an `isLikedByMe` flag
     * resolved via a single batched query against the polymorphic Like table.
     */
    getPublicFeed(limit: number, sort: SortOrder, cursor?: string, currentUserId?: bigint): Promise<{
        posts: any[];
        nextCursor: string | null;
    }>;
    /**
     * Paginated list of the authenticated user's own posts (public + private).
     */
    getMyPosts(userId: bigint, limit: number, sort: SortOrder, cursor?: string): Promise<{
        posts: ({
            user: {
                id: bigint;
                uuid: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: bigint;
            uuid: string;
            createdAt: Date;
            updatedAt: Date;
            userId: bigint;
            content: string;
            imageUrl: string | null;
            privacyType: PostPrivacy;
            isDeleted: boolean;
            likeCount: bigint;
            commentCount: bigint;
        } & {
            isLikedByMe: boolean;
        })[];
        nextCursor: string | null;
    }>;
    /**
     * Fetch a single post by its public UUID.
     *
     * Private posts are only visible to their author; for everyone else
     * a {@link NotFoundError} is thrown so we don't leak the post's existence.
     *
     * @throws {NotFoundError} if the post doesn't exist, is deleted,
     *                         or is private and not owned by the caller
     */
    getPostByUuid(postUuid: string, currentUserId?: bigint): Promise<{
        isLikedByMe: boolean;
        user: {
            id: bigint;
            uuid: string;
            firstName: string;
            lastName: string;
        };
        id: bigint;
        uuid: string;
        createdAt: Date;
        updatedAt: Date;
        userId: bigint;
        content: string;
        imageUrl: string | null;
        privacyType: PostPrivacy;
        isDeleted: boolean;
        likeCount: bigint;
        commentCount: bigint;
    }>;
    invalidatePublicFeedCache(): Promise<void>;
    /**
     * Create a new post for the given user.
     * Content is sanitized before persisting.
     */
    createPost(userId: bigint, data: {
        content: string;
        imageUrl?: string;
        privacyType: PostPrivacy;
    }): Promise<any>;
    /**
     * Update an existing post. Only the author may update.
     *
     * @throws {NotFoundError}  if the post doesn't exist or is deleted
     * @throws {ForbiddenError} if the caller is not the author
     */
    updatePost(postUuid: string, userId: bigint, data: {
        content?: string;
        privacyType?: PostPrivacy;
    }): Promise<any>;
    /**
     * Soft-delete a post. Only the author may delete.
     *
     * @throws {NotFoundError}  if the post doesn't exist or is already deleted
     * @throws {ForbiddenError} if the caller is not the author
     */
    deletePost(postUuid: string, userId: bigint): Promise<void>;
    private normalizeCachedPost;
    /**
     * Attach an `isLikedByMe` boolean to every item in a list.
     *
     * Performs a single `findMany` query against the polymorphic Like table
     * to determine which target IDs the current user has liked, then maps
     * the flag onto each item.
     */
    private attachIsLikedByMe;
    /**
     * Check whether a single target has been liked by the given user.
     */
    private checkSingleLike;
}
export declare const postService: PostService;
//# sourceMappingURL=post.service.d.ts.map