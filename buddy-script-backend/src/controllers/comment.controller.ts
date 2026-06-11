import { Request, Response } from 'express';
import { commentService } from '../services/comment.service.js';
import { likeService } from '../services/like.service.js';
import {
  formatCommentResponse,
  formatCursorPaginationMeta,
  formatUserResponse,
} from '../utils/helpers.js';

type SortOrder = 'newest' | 'oldest';

export const getComments = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;
  const sort = ((req.query.sort as string) || 'newest') as SortOrder;
  const cursor = req.query.cursor as string | undefined;
  const currentUserId = req.user?.id;

  const { comments, nextCursor } = await commentService.getCommentsByPost(
    postId as string,
    limit,
    sort,
    cursor,
    currentUserId,
  );

  const formattedComments = comments.map((comment: any) => {
    const isLikedByMe = Boolean((comment as { isLikedByMe?: boolean }).isLikedByMe);
    return formatCommentResponse(comment, isLikedByMe);
  });

  res.status(200).json({
    success: true,
    data: formattedComments,
    meta: formatCursorPaginationMeta(limit, nextCursor),
  });
};

export const createComment = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;
  const { content } = req.body;

  const comment = await commentService.createComment(postId as string, req.user!.id, content);

  res.status(201).json({
    success: true,
    data: formatCommentResponse(comment, false),
  });
};

export const updateComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await commentService.updateComment(commentId as string, req.user!.id, content);

  const isLikedByMe = Boolean((comment as { isLikedByMe?: boolean }).isLikedByMe);

  res.status(200).json({
    success: true,
    data: formatCommentResponse(comment, isLikedByMe),
  });
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;

  await commentService.deleteComment(commentId as string, req.user!.id);

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully',
  });
};

export const likeComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;

  const result = await likeService.likeTarget(req.user!.id, 'comment', commentId as string);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const unlikeComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;

  const result = await likeService.unlikeTarget(req.user!.id, 'comment', commentId as string);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getCommentLikers = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;
  const cursor = req.query.cursor as string | undefined;
  const currentUserId = req.user?.id;

  const { users, nextCursor } = await likeService.getLikers(
    'comment',
    commentId as string,
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
