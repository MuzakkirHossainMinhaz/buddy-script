/**
 * Safely converts a BigInt value to a JavaScript number.
 * Throws a RangeError if the value exceeds Number.MAX_SAFE_INTEGER.
 */
export declare function bigIntToNumber(value: bigint): number;
/**
 * Sanitizes user-generated content to prevent XSS attacks.
 */
export declare function sanitizeContent(content: string): string;
/** Shape of a Prisma User record (relevant fields). */
interface PrismaUser {
    uuid: string;
    firstName: string;
    lastName: string;
    email?: string;
}
/** Formatted user response returned by the API. */
export interface FormattedUserResponse {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
}
/**
 * Formats a Prisma User for API response.
 * Uses uuid as the public-facing `id`. Never exposes the BigInt id.
 */
export declare function formatUserResponse(user: PrismaUser): FormattedUserResponse;
/** Shape of a Prisma Post record with its author. */
interface PrismaPostWithUser {
    uuid: string;
    content: string;
    imageUrl: string | null;
    privacyType: string;
    likeCount: bigint;
    commentCount: bigint;
    createdAt: Date;
    updatedAt: Date;
    user: PrismaUser;
}
/** Formatted post response returned by the API. */
export interface FormattedPostResponse {
    id: string;
    content: string;
    imageUrl: string | null;
    privacyType: string;
    likeCount: number;
    commentCount: number;
    isLikedByMe: boolean;
    createdAt: string;
    updatedAt: string;
    author: FormattedUserResponse;
}
/**
 * Formats a Prisma Post for API response.
 * Converts BigInt counts to numbers and uses uuid as the public `id`.
 */
export declare function formatPostResponse(post: PrismaPostWithUser, isLikedByMe: boolean): FormattedPostResponse;
/** Shape of a Prisma Comment record with its author. */
interface PrismaCommentWithUser {
    uuid: string;
    content: string;
    likeCount: bigint;
    replyCount: bigint;
    createdAt: Date;
    updatedAt: Date;
    user: PrismaUser;
}
/** Formatted comment response returned by the API. */
export interface FormattedCommentResponse {
    id: string;
    content: string;
    likeCount: number;
    replyCount: number;
    isLikedByMe: boolean;
    createdAt: string;
    updatedAt: string;
    author: FormattedUserResponse;
}
/**
 * Formats a Prisma Comment for API response.
 * Converts BigInt counts to numbers and uses uuid as the public `id`.
 */
export declare function formatCommentResponse(comment: PrismaCommentWithUser, isLikedByMe: boolean): FormattedCommentResponse;
/** Shape of a Prisma Reply record with its author. */
interface PrismaReplyWithUser {
    uuid: string;
    content: string;
    parentReplyId: bigint | null;
    likeCount: bigint;
    createdAt: Date;
    updatedAt: Date;
    user: PrismaUser;
    parentReply?: {
        uuid: string;
    } | null;
}
/** Formatted reply response returned by the API. */
export interface FormattedReplyResponse {
    id: string;
    content: string;
    parentReplyId: string | null;
    likeCount: number;
    isLikedByMe: boolean;
    createdAt: string;
    updatedAt: string;
    author: FormattedUserResponse;
}
/**
 * Formats a Prisma Reply for API response.
 * Converts BigInt counts to numbers and uses uuid as the public `id`.
 * Maps parentReplyId to the parent reply's uuid when available.
 */
export declare function formatReplyResponse(reply: PrismaReplyWithUser, isLikedByMe: boolean): FormattedReplyResponse;
/** Pagination metadata included in paginated API responses. */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface CursorPaginationMeta {
    limit: number;
    nextCursor: string | null;
    hasNext: boolean;
}
/**
 * Computes pagination metadata from total count, current page, and page size.
 */
export declare function formatPaginationMeta(total: number, page: number, limit: number): PaginationMeta;
export declare function formatCursorPaginationMeta(limit: number, nextCursor: string | null): CursorPaginationMeta;
export {};
//# sourceMappingURL=helpers.d.ts.map