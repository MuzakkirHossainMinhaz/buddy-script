import { likeService } from '../services/like.service.js';
import { replyService } from '../services/reply.service.js';
import { formatCursorPaginationMeta, formatReplyResponse, formatUserResponse, } from '../utils/helpers.js';
export const getReplies = async (req, res) => {
    const { commentId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const sort = (req.query.sort || 'newest');
    const cursor = req.query.cursor;
    const currentUserId = req.user?.id;
    const { replies, nextCursor } = await replyService.getRepliesByComment(commentId, limit, sort, cursor, currentUserId);
    const formattedReplies = replies.map((reply) => {
        const isLikedByMe = Boolean(reply.isLikedByMe);
        return formatReplyResponse(reply, isLikedByMe);
    });
    res.status(200).json({
        success: true,
        data: formattedReplies,
        meta: formatCursorPaginationMeta(limit, nextCursor),
    });
};
export const createReply = async (req, res) => {
    const { commentId } = req.params;
    const { content, parentReplyId } = req.body;
    const reply = await replyService.createReply(commentId, req.user.id, content, parentReplyId);
    res.status(201).json({
        success: true,
        data: formatReplyResponse(reply, false),
    });
};
export const updateReply = async (req, res) => {
    const { replyId } = req.params;
    const { content } = req.body;
    const reply = await replyService.updateReply(replyId, req.user.id, content);
    const isLikedByMe = Boolean(reply.isLikedByMe);
    res.status(200).json({
        success: true,
        data: formatReplyResponse(reply, isLikedByMe),
    });
};
export const deleteReply = async (req, res) => {
    const { replyId } = req.params;
    await replyService.deleteReply(replyId, req.user.id);
    res.status(200).json({
        success: true,
        message: 'Reply deleted successfully',
    });
};
export const likeReply = async (req, res) => {
    const { replyId } = req.params;
    const result = await likeService.likeTarget(req.user.id, 'reply', replyId);
    res.status(200).json({
        success: true,
        data: result,
    });
};
export const unlikeReply = async (req, res) => {
    const { replyId } = req.params;
    const result = await likeService.unlikeTarget(req.user.id, 'reply', replyId);
    res.status(200).json({
        success: true,
        data: result,
    });
};
export const getReplyLikers = async (req, res) => {
    const { replyId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;
    const currentUserId = req.user?.id;
    const { users, nextCursor } = await likeService.getLikers('reply', replyId, limit, cursor, currentUserId);
    const formattedUsers = users.map((user) => formatUserResponse(user));
    res.status(200).json({
        success: true,
        data: formattedUsers,
        meta: formatCursorPaginationMeta(limit, nextCursor),
    });
};
//# sourceMappingURL=reply.controller.js.map