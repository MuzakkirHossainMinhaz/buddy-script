import { type SortOrder } from '../utils/cursor.js';
export declare class CommentService {
    /**
     * Paginated comments for a given post.
     *
     * Each comment includes up to 3 of its earliest replies so the client
     * can render a preview without a second round-trip.
     *
     * @throws {NotFoundError} if the post doesn't exist, is deleted, or is
     *                         private and not owned by the caller
     */
    getCommentsByPost(postUuid: string, limit: number, sort: SortOrder, cursor?: string, currentUserId?: bigint): Promise<{
        comments: ({
            replies: ({
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
                isDeleted: boolean;
                likeCount: bigint;
                commentId: bigint;
                parentReplyId: bigint | null;
            })[];
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
            isDeleted: boolean;
            likeCount: bigint;
            postId: bigint;
            replyCount: bigint;
        } & {
            isLikedByMe: boolean;
        })[];
        nextCursor: string | null;
    }>;
    /**
     * Add a comment to a post.
     *
     * Runs inside a transaction so the post's `commentCount` stays in sync
     * with the actual number of non-deleted comments.
     *
     * @throws {NotFoundError} if the post doesn't exist, is deleted, or
     *                         is private and not owned by the caller
     */
    createComment(postUuid: string, userId: bigint, content: string): Promise<any>;
    /**
     * Update the content of a comment. Only the author may update.
     *
     * @throws {NotFoundError}  if the comment doesn't exist or is deleted
     * @throws {ForbiddenError} if the caller is not the author
     */
    updateComment(commentUuid: string, userId: bigint, content: string): Promise<{
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
        isDeleted: boolean;
        likeCount: bigint;
        postId: bigint;
        replyCount: bigint;
    }>;
    /**
     * Soft-delete a comment and decrement the parent post's `commentCount`.
     *
     * @throws {NotFoundError}  if the comment doesn't exist or is already deleted
     * @throws {ForbiddenError} if the caller is not the author
     */
    deleteComment(commentUuid: string, userId: bigint): Promise<void>;
    /**
     * Batch-check which items the current user has liked and attach
     * an `isLikedByMe` flag to each item.
     */
    private attachIsLikedByMe;
}
export declare const commentService: CommentService;
//# sourceMappingURL=comment.service.d.ts.map