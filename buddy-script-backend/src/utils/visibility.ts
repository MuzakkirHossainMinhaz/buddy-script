import { NotFoundError } from './errors.js';

export type VisibilityPost = {
  id: bigint;
  userId: bigint;
  privacyType: string;
  isDeleted: boolean;
};

export function canViewPost(post: VisibilityPost, currentUserId?: bigint): boolean {
  return post.privacyType === 'public' || post.userId === currentUserId;
}

export function assertCanViewPost(
  post: VisibilityPost | null,
  currentUserId?: bigint,
): asserts post is VisibilityPost {
  if (!post || post.isDeleted || !canViewPost(post, currentUserId)) {
    throw new NotFoundError('Post');
  }
}
