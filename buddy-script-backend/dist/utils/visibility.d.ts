export type VisibilityPost = {
    id: bigint;
    userId: bigint;
    privacyType: string;
    isDeleted: boolean;
};
export declare function canViewPost(post: VisibilityPost, currentUserId?: bigint): boolean;
export declare function assertCanViewPost(post: VisibilityPost | null, currentUserId?: bigint): asserts post is VisibilityPost;
//# sourceMappingURL=visibility.d.ts.map