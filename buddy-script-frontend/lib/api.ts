import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ApiItemResponse,
  ApiListResponse,
  AuthResponse,
  Comment,
  LikeResponse,
  Post,
  PrivacyType,
  Reply,
  User,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

export const assetUrl = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL.replace(/\/api$/, "")}${path}`;
};

export const buddyApi = createApi({
  reducerPath: "buddyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  tagTypes: ["Auth", "Post", "Comment", "Reply", "Likers"],
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => "/auth/me",
      transformResponse: (response: AuthResponse) => response.data.user,
      providesTags: ["Auth"],
    }),
    login: builder.mutation<User, { email: string; password: string }>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: AuthResponse) => response.data.user,
      invalidatesTags: ["Auth", "Post"],
    }),
    register: builder.mutation<
      User,
      { firstName: string; lastName: string; email: string; password: string }
    >({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      transformResponse: (response: AuthResponse) => response.data.user,
      invalidatesTags: ["Auth", "Post"],
    }),
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "Post"],
    }),
    getPosts: builder.query<ApiListResponse<Post>, { cursor?: string; limit?: number } | void>({
      query: (params) => ({
        url: "/posts",
        params: {
          limit: params?.limit ?? 10,
          sort: "newest",
          ...(params?.cursor ? { cursor: params.cursor } : {}),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((post) => ({ type: "Post" as const, id: post.id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),
    getMyPosts: builder.query<ApiListResponse<Post>, { cursor?: string; limit?: number } | void>({
      query: (params) => ({
        url: "/posts/me",
        params: {
          limit: params?.limit ?? 10,
          sort: "newest",
          ...(params?.cursor ? { cursor: params.cursor } : {}),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((post) => ({ type: "Post" as const, id: post.id })),
              { type: "Post", id: "MY-LIST" },
            ]
          : [{ type: "Post", id: "MY-LIST" }],
    }),
    createPost: builder.mutation<Post, { content: string; privacyType: PrivacyType; image?: File | null }>({
      query: ({ content, privacyType, image }) => {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("privacyType", privacyType);
        if (image) {
          formData.append("image", image);
        }

        return {
          url: "/posts",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: ApiItemResponse<Post>) => response.data,
      invalidatesTags: [{ type: "Post", id: "LIST" }, { type: "Post", id: "MY-LIST" }],
    }),
    updatePost: builder.mutation<Post, { postId: string; content?: string; privacyType?: PrivacyType }>({
      query: ({ postId, ...body }) => ({
        url: `/posts/${postId}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiItemResponse<Post>) => response.data,
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Post", id: postId },
        { type: "Post", id: "LIST" },
        { type: "Post", id: "MY-LIST" },
      ],
    }),
    likePost: builder.mutation<LikeResponse["data"], { postId: string; liked: boolean }>({
      query: ({ postId, liked }) => ({
        url: `/posts/${postId}/like`,
        method: liked ? "DELETE" : "POST",
      }),
      transformResponse: (response: LikeResponse) => response.data,
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Post", id: postId },
        { type: "Post", id: "LIST" },
        { type: "Likers", id: `post-${postId}` },
      ],
    }),
    getPostLikers: builder.query<User[], string>({
      query: (postId) => `/posts/${postId}/likes?limit=30`,
      transformResponse: (response: ApiListResponse<User>) => response.data,
      providesTags: (_result, _error, postId) => [{ type: "Likers", id: `post-${postId}` }],
    }),
    getComments: builder.query<ApiListResponse<Comment>, { postId: string; cursor?: string }>({
      query: ({ postId, cursor }) => ({
        url: `/posts/${postId}/comments`,
        params: { limit: 20, sort: "oldest", ...(cursor ? { cursor } : {}) },
      }),
      providesTags: (result, _error, { postId }) =>
        result
          ? [
              ...result.data.map((comment) => ({ type: "Comment" as const, id: comment.id })),
              { type: "Comment", id: `LIST-${postId}` },
            ]
          : [{ type: "Comment", id: `LIST-${postId}` }],
    }),
    createComment: builder.mutation<Comment, { postId: string; content: string }>({
      query: ({ postId, content }) => ({
        url: `/posts/${postId}/comments`,
        method: "POST",
        body: { content },
      }),
      transformResponse: (response: ApiItemResponse<Comment>) => response.data,
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Comment", id: `LIST-${postId}` },
        { type: "Post", id: "LIST" },
      ],
    }),
    likeComment: builder.mutation<LikeResponse["data"], { commentId: string; liked: boolean }>({
      query: ({ commentId, liked }) => ({
        url: `/comments/${commentId}/like`,
        method: liked ? "DELETE" : "POST",
      }),
      transformResponse: (response: LikeResponse) => response.data,
      invalidatesTags: (_result, _error, { commentId }) => [
        { type: "Comment", id: commentId },
        { type: "Likers", id: `comment-${commentId}` },
      ],
    }),
    getCommentLikers: builder.query<User[], string>({
      query: (commentId) => `/comments/${commentId}/likes?limit=30`,
      transformResponse: (response: ApiListResponse<User>) => response.data,
      providesTags: (_result, _error, commentId) => [{ type: "Likers", id: `comment-${commentId}` }],
    }),
    getReplies: builder.query<ApiListResponse<Reply>, { commentId: string; cursor?: string }>({
      query: ({ commentId, cursor }) => ({
        url: `/comments/${commentId}/replies`,
        params: { limit: 20, sort: "oldest", ...(cursor ? { cursor } : {}) },
      }),
      providesTags: (result, _error, { commentId }) =>
        result
          ? [
              ...result.data.map((reply) => ({ type: "Reply" as const, id: reply.id })),
              { type: "Reply", id: `LIST-${commentId}` },
            ]
          : [{ type: "Reply", id: `LIST-${commentId}` }],
    }),
    createReply: builder.mutation<Reply, { commentId: string; content: string; parentReplyId?: string | null }>({
      query: ({ commentId, content, parentReplyId }) => ({
        url: `/comments/${commentId}/replies`,
        method: "POST",
        body: { content, ...(parentReplyId ? { parentReplyId } : {}) },
      }),
      transformResponse: (response: ApiItemResponse<Reply>) => response.data,
      invalidatesTags: (_result, _error, { commentId }) => [
        { type: "Reply", id: `LIST-${commentId}` },
        { type: "Comment", id: commentId },
      ],
    }),
    likeReply: builder.mutation<LikeResponse["data"], { replyId: string; liked: boolean; commentId: string }>({
      query: ({ replyId, liked }) => ({
        url: `/replies/${replyId}/like`,
        method: liked ? "DELETE" : "POST",
      }),
      transformResponse: (response: LikeResponse) => response.data,
      invalidatesTags: (_result, _error, { replyId, commentId }) => [
        { type: "Reply", id: replyId },
        { type: "Reply", id: `LIST-${commentId}` },
        { type: "Likers", id: `reply-${replyId}` },
      ],
    }),
    getReplyLikers: builder.query<User[], string>({
      query: (replyId) => `/replies/${replyId}/likes?limit=30`,
      transformResponse: (response: ApiListResponse<User>) => response.data,
      providesTags: (_result, _error, replyId) => [{ type: "Likers", id: `reply-${replyId}` }],
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useCreatePostMutation,
  useCreateReplyMutation,
  useGetCommentLikersQuery,
  useGetCommentsQuery,
  useGetMeQuery,
  useGetPostLikersQuery,
  useGetPostsQuery,
  useGetMyPostsQuery,
  useGetRepliesQuery,
  useGetReplyLikersQuery,
  useLikeCommentMutation,
  useLikePostMutation,
  useLikeReplyMutation,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdatePostMutation,
} = buddyApi;
