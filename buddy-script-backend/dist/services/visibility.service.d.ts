import { assertCanViewPost } from '../utils/visibility.js';
export declare class VisibilityService {
    assertCanViewPost: typeof assertCanViewPost;
    getVisiblePostByUuid(postUuid: string, currentUserId?: bigint): Promise<{
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
        isDeleted: boolean;
        content: string;
        imageUrl: string | null;
        privacyType: import("../generated/enums.js").PostPrivacy;
        likeCount: bigint;
        commentCount: bigint;
    }>;
    getVisibleCommentByUuid(commentUuid: string, currentUserId?: bigint): Promise<{
        post: {
            id: bigint;
            uuid: string;
            createdAt: Date;
            updatedAt: Date;
            userId: bigint;
            isDeleted: boolean;
            content: string;
            imageUrl: string | null;
            privacyType: import("../generated/enums.js").PostPrivacy;
            likeCount: bigint;
            commentCount: bigint;
        };
    } & {
        id: bigint;
        uuid: string;
        createdAt: Date;
        updatedAt: Date;
        userId: bigint;
        isDeleted: boolean;
        content: string;
        likeCount: bigint;
        postId: bigint;
        replyCount: bigint;
    }>;
    getVisibleReplyByUuid(replyUuid: string, currentUserId?: bigint): Promise<{
        comment: {
            post: {
                id: bigint;
                uuid: string;
                createdAt: Date;
                updatedAt: Date;
                userId: bigint;
                isDeleted: boolean;
                content: string;
                imageUrl: string | null;
                privacyType: import("../generated/enums.js").PostPrivacy;
                likeCount: bigint;
                commentCount: bigint;
            };
        } & {
            id: bigint;
            uuid: string;
            createdAt: Date;
            updatedAt: Date;
            userId: bigint;
            isDeleted: boolean;
            content: string;
            likeCount: bigint;
            postId: bigint;
            replyCount: bigint;
        };
    } & {
        id: bigint;
        uuid: string;
        createdAt: Date;
        updatedAt: Date;
        userId: bigint;
        isDeleted: boolean;
        content: string;
        likeCount: bigint;
        commentId: bigint;
        parentReplyId: bigint | null;
    }>;
}
export declare const visibilityService: VisibilityService;
//# sourceMappingURL=visibility.service.d.ts.map