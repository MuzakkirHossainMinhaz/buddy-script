import { Request, Response } from 'express';
import type { PostPrivacy } from '../generated/enums.js';
import { likeService } from '../services/like.service.js';
import { postService } from '../services/post.service.js';
import {
  formatCursorPaginationMeta,
  formatPostResponse,
  formatUserResponse,
} from '../utils/helpers.js';

type SortOrder = 'newest' | 'oldest';

export const getPublicFeed = async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const sort = ((req.query.sort as string) || 'newest') as SortOrder;
  const cursor = req.query.cursor as string | undefined;
  const currentUserId = req.user?.id;

  const { posts, nextCursor } = await postService.getPublicFeed(limit, sort, cursor, currentUserId);

  const formattedPosts = posts.map((post: any) => {
    const isLikedByMe = Boolean((post as { isLikedByMe?: boolean }).isLikedByMe);
    return formatPostResponse(post, isLikedByMe);
  });

  res.status(200).json({
    success: true,
    data: formattedPosts,
    meta: formatCursorPaginationMeta(limit, nextCursor),
  });
};

export const getMyPosts = async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const sort = ((req.query.sort as string) || 'newest') as SortOrder;
  const cursor = req.query.cursor as string | undefined;

  const { posts, nextCursor } = await postService.getMyPosts(req.user!.id, limit, sort, cursor);

  const formattedPosts = posts.map((post: any) => {
    const isLikedByMe = Boolean((post as { isLikedByMe?: boolean }).isLikedByMe);
    return formatPostResponse(post, isLikedByMe);
  });

  res.status(200).json({
    success: true,
    data: formattedPosts,
    meta: formatCursorPaginationMeta(limit, nextCursor),
  });
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;
  const currentUserId = req.user?.id;

  const post = await postService.getPostByUuid(postId as string, currentUserId);

  const isLikedByMe = Boolean((post as { isLikedByMe?: boolean }).isLikedByMe);

  res.status(200).json({
    success: true,
    data: formatPostResponse(post, isLikedByMe),
  });
};

export const createPost = async (req: Request, res: Response): Promise<void> => {
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
  const post = await postService.createPost(req.user!.id, {
    ...req.body,
    imageUrl,
    privacyType: req.body.privacyType as PostPrivacy,
  });

  res.status(201).json({
    success: true,
    data: formatPostResponse(post, false),
  });
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;

  const post = await postService.updatePost(postId as string, req.user!.id, {
    ...req.body,
    privacyType: req.body.privacyType as PostPrivacy | undefined,
  });

  const isLikedByMe = Boolean((post as { isLikedByMe?: boolean }).isLikedByMe);

  res.status(200).json({
    success: true,
    data: formatPostResponse(post, isLikedByMe),
  });
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;

  await postService.deletePost(postId as string, req.user!.id);

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
};

export const likePost = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;

  const result = await likeService.likeTarget(req.user!.id, 'post', postId as string);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const unlikePost = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;

  const result = await likeService.unlikeTarget(req.user!.id, 'post', postId as string);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getPostLikers = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;
  const cursor = req.query.cursor as string | undefined;
  const currentUserId = req.user?.id;

  const { users, nextCursor } = await likeService.getLikers(
    'post',
    postId as string,
    limit,
    cursor,
    currentUserId,
  );

  const formattedUsers = users.map((user: any) => formatUserResponse(user));

  res.status(200).json({
    success: true,
    data: formattedUsers,
    meta: formatCursorPaginationMeta(limit, nextCursor),
  });
};
