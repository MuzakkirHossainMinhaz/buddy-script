import xss from 'xss';

/**
 * Safely converts a BigInt value to a JavaScript number.
 * Throws a RangeError if the value exceeds Number.MAX_SAFE_INTEGER.
 */
export function bigIntToNumber(value: bigint): number {
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
export function sanitizeContent(content: string): string {
  return xss(content);
}

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
export function formatUserResponse(user: PrismaUser): FormattedUserResponse {
  return {
    id: user.uuid,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}

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
export function formatPostResponse(
  post: PrismaPostWithUser,
  isLikedByMe: boolean,
): FormattedPostResponse {
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
export function formatCommentResponse(
  comment: PrismaCommentWithUser,
  isLikedByMe: boolean,
): FormattedCommentResponse {
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

/** Shape of a Prisma Reply record with its author. */
interface PrismaReplyWithUser {
  uuid: string;
  content: string;
  parentReplyId: bigint | null;
  likeCount: bigint;
  createdAt: Date;
  updatedAt: Date;
  user: PrismaUser;
  parentReply?: { uuid: string } | null;
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
export function formatReplyResponse(
  reply: PrismaReplyWithUser,
  isLikedByMe: boolean,
): FormattedReplyResponse {
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
export function formatPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
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

export function formatCursorPaginationMeta(
  limit: number,
  nextCursor: string | null,
): CursorPaginationMeta {
  return {
    limit,
    nextCursor,
    hasNext: nextCursor !== null,
  };
}
