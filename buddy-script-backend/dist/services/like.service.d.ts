import type { LikeTargetType } from '../generated/enums.js';
type TargetType = LikeTargetType;
export declare class LikeService {
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
    likeTarget(userId: bigint, targetType: TargetType, targetUuid: string): Promise<{
        liked: boolean;
        likeCount: bigint;
    }>;
    /**
     * Remove a like from a post, comment, or reply.
     *
     * @throws {NotFoundError} if the target doesn't exist or the like record
     *                         doesn't exist (can't unlike something you haven't liked)
     */
    unlikeTarget(userId: bigint, targetType: TargetType, targetUuid: string): Promise<{
        liked: boolean;
        likeCount: bigint;
    }>;
    /**
     * Paginated list of users who liked a given target.
     *
     * @throws {NotFoundError} if the target doesn't exist or is deleted
     */
    getLikers(targetType: TargetType, targetUuid: string, limit: number, cursor?: string, currentUserId?: bigint): Promise<{
        users: any[];
        nextCursor: string | null;
    }>;
    /**
     * Resolve a target's public UUID to its internal BigInt ID and current
     * like count.
     *
     * Each target type is handled independently because the Like model is
     * polymorphic (no FK relations to Post/Comment/Reply).
     *
     * @throws {NotFoundError} if the target doesn't exist or is soft-deleted
     */
    private resolveTarget;
    private parseLikeCursor;
    /**
     * Increment `likeCount` on the target model and return the new count.
     */
    private incrementLikeCount;
    /**
     * Decrement `likeCount` on the target model (floored at 0) and return
     * the new count.
     *
     * Reads the current count first to avoid negative values from race
     * conditions or stale data.
     */
    private decrementLikeCount;
    private getCurrentLikeCount;
    private enqueueCounterDelta;
}
export declare const likeService: LikeService;
export {};
//# sourceMappingURL=like.service.d.ts.map