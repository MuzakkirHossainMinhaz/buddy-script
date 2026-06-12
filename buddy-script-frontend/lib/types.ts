export type PrivacyType = "public" | "private";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  privacyType: PrivacyType;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
  createdAt: string;
  updatedAt: string;
  author: User;
}

export interface Comment {
  id: string;
  content: string;
  likeCount: number;
  replyCount: number;
  isLikedByMe: boolean;
  createdAt: string;
  updatedAt: string;
  author: User;
}

export interface Reply {
  id: string;
  content: string;
  parentReplyId: string | null;
  likeCount: number;
  isLikedByMe: boolean;
  createdAt: string;
  updatedAt: string;
  author: User;
}

export interface CursorMeta {
  limit: number;
  nextCursor: string | null;
  hasNext: boolean;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  meta: CursorMeta;
}

export interface ApiItemResponse<T> {
  success: boolean;
  data: T;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface LikeResponse {
  success: boolean;
  data: {
    liked: boolean;
    likeCount: number;
  };
}
