import xss from 'xss';
/**
 * Safely converts a BigInt value to a JavaScript number.
 * Throws a RangeError if the value exceeds Number.MAX_SAFE_INTEGER.
 */
export function bigIntToNumber(value) {
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new RangeError(`BigInt value ${value} exceeds Number.MAX_SAFE_INTEGER`);
    }
    if (value < BigInt(Number.MIN_SAFE_INTEGER)) {
        throw new RangeError(`BigInt value ${value} exceeds Number.MIN_SAFE_INTEGER`);
    }
    return Number(value);
}
/**
 * Sanitizes user-generated content to prevent XSS attacks.
 */
export function sanitizeContent(content) {
    return xss(content);
}
/**
 * Formats a Prisma User for API response.
 * Uses uuid as the public-facing `id`. Never exposes the BigInt id.
 */
export function formatUserResponse(user) {
    return {
        id: user.uuid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    };
}
/**
 * Formats a Prisma Post for API response.
 * Converts BigInt counts to numbers and uses uuid as the public `id`.
 */
export function formatPostResponse(post, isLikedByMe) {
    return {
        id: post.uuid,
        content: post.content,
        imageUrl: post.imageUrl,
        privacyType: post.privacyType,
        likeCount: bigIntToNumber(post.likeCount),
        commentCount: bigIntToNumber(post.commentCount),
        isLikedByMe,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        author: formatUserResponse(post.user),
    };
}
/**
 * Formats a Prisma Comment for API response.
 * Converts BigInt counts to numbers and uses uuid as the public `id`.
 */
export function formatCommentResponse(comment, isLikedByMe) {
    return {
        id: comment.uuid,
        content: comment.content,
        likeCount: bigIntToNumber(comment.likeCount),
        replyCount: bigIntToNumber(comment.replyCount),
        isLikedByMe,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        author: formatUserResponse(comment.user),
    };
}
/**
 * Formats a Prisma Reply for API response.
 * Converts BigInt counts to numbers and uses uuid as the public `id`.
 * Maps parentReplyId to the parent reply's uuid when available.
 */
export function formatReplyResponse(reply, isLikedByMe) {
    return {
        id: reply.uuid,
        content: reply.content,
        parentReplyId: reply.parentReply?.uuid ?? null,
        likeCount: bigIntToNumber(reply.likeCount),
        isLikedByMe,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
        author: formatUserResponse(reply.user),
    };
}
/**
 * Computes pagination metadata from total count, current page, and page size.
 */
export function formatPaginationMeta(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}
export function formatCursorPaginationMeta(limit, nextCursor) {
    return {
        limit,
        nextCursor,
        hasNext: nextCursor !== null,
    };
}
//# sourceMappingURL=helpers.js.map