import { type SortOrder } from '../utils/cursor.js';
export declare class ReplyService {
    /**
     * Paginated replies for a given comment.
     *
     * @throws {NotFoundError} if the comment doesn't exist or is deleted
     */
    getRepliesByComment(commentUuid: string, limit: number, sort: SortOrder, cursor?: string, currentUserId?: bigint): Promise<{
        replies: ({
            user: {
                id: bigint;
                uuid: string;
                firstName: string;
                lastName: string;
            };
            parentReply: {
                uuid: string;
            } | null;
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
        } & {
            isLikedByMe: boolean;
        })[];
        nextCursor: string | null;
    }>;
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
    createReply(commentUuid: string, userId: bigint, content: string, parentReplyUuid?: string): Promise<any>;
    /**
     * Update the content of a reply. Only the author may update.
     *
     * @throws {NotFoundError}  if the reply doesn't exist or is deleted
     * @throws {ForbiddenError} if the caller is not the author
     */
    updateReply(replyUuid: string, userId: bigint, content: string): Promise<{
        user: {
            id: bigint;
            uuid: string;
            firstName: string;
            lastName: string;
        };
        parentReply: {
            uuid: string;
        } | null;
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
    }>;
    /**
     * Soft-delete a reply and decrement the parent comment's `replyCount`.
     *
     * @throws {NotFoundError}  if the reply doesn't exist or is already deleted
     * @throws {ForbiddenError} if the caller is not the author
     */
    deleteReply(replyUuid: string, userId: bigint): Promise<void>;
    /**
     * Batch-check which items the current user has liked and attach
     * an `isLikedByMe` flag to each item.
     */
    private attachIsLikedByMe;
}
export declare const replyService: ReplyService;
//# sourceMappingURL=reply.service.d.ts.map