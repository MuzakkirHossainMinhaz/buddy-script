import { Request, Response } from 'express';
import { likeService } from '../services/like.service.js';
import { replyService } from '../services/reply.service.js';
import {
  formatCursorPaginationMeta,
  formatReplyResponse,
  formatUserResponse,
} from '../utils/helpers.js';

type SortOrder = 'newest' | 'oldest';

export const getReplies = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;
  const sort = ((req.query.sort as string) || 'newest') as SortOrder;
  const cursor = req.query.cursor as string | undefined;
  const currentUserId = req.user?.id;

  const { replies, nextCursor } = await replyService.getRepliesByComment(
    commentId as string,
    limit,
    sort,
    cursor,
    currentUserId,
  );

  const formattedReplies = replies.map((reply: any) => {
    const isLikedByMe = Boolean((reply as { isLikedByMe?: boolean }).isLikedByMe);
    return formatReplyResponse(reply, isLikedByMe);
  });

  res.status(200).json({
    success: true,
    data: formattedReplies,
    meta: formatCursorPaginationMeta(limit, nextCursor),
  });
};

export const createReply = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const { content, parentReplyId } = req.body;

  const reply = await replyService.createReply(commentId as string, req.user!.id, content, parentReplyId);

  res.status(201).json({
    success: true,
    data: formatReplyResponse(reply, false),
  });
};

export const updateReply = async (req: Request, res: Response): Promise<void> => {
  const { replyId } = req.params;
  const { content } = req.body;

  const reply = await replyService.updateReply(replyId as string, req.user!.id, content);

  const isLikedByMe = Boolean((reply as { isLikedByMe?: boolean }).isLikedByMe);

  res.status(200).json({
    success: true,
    data: formatReplyResponse(reply, isLikedByMe),
  });
};

export const deleteReply = async (req: Request, res: Response): Promise<void> => {
  const { replyId } = req.params;

  await replyService.deleteReply(replyId as string, req.user!.id);

  res.status(200).json({
    success: true,
    message: 'Reply deleted successfully',
  });
};

export const likeReply = async (req: Request, res: Response): Promise<void> => {
  const { replyId } = req.params;

  const result = await likeService.likeTarget(req.user!.id, 'reply', replyId as string);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const unlikeReply = async (req: Request, res: Response): Promise<void> => {
  const { replyId } = req.params;

  const result = await likeService.unlikeTarget(req.user!.id, 'reply', replyId as string);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getReplyLikers = async (req: Request, res: Response): Promise<void> => {
  const { replyId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;
  const cursor = req.query.cursor as string | undefined;
  const currentUserId = req.user?.id;

  const { users, nextCursor } = await likeService.getLikers(
    'reply',
    replyId as string,
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
