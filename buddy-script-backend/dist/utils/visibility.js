import { NotFoundError } from './errors.js';
export function canViewPost(post, currentUserId) {
    return post.privacyType === 'public' || post.userId === currentUserId;
}
export function assertCanViewPost(post, currentUserId) {
    if (!post || post.isDeleted || !canViewPost(post, currentUserId)) {
        throw new NotFoundError('Post');
    }
}
//# sourceMappingURL=visibility.js.map