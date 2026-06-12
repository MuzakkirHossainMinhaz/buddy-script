import { commentService } from '../services/comment.service.js';
import { likeService } from '../services/like.service.js';
import { formatCommentResponse, formatCursorPaginationMeta, formatUserResponse, } from '../utils/helpers.js';
export const getComments = async (req, res) => {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const sort = (req.query.sort || 'newest');
    const cursor = req.query.cursor;
    const currentUserId = req.user?.id;
    const { comments, nextCursor } = await commentService.getCommentsByPost(postId, limit, sort, cursor, currentUserId);
    const formattedComments = comments.map((comment) => {
        const isLikedByMe = Boolean(comment.isLikedByMe);
        return formatCommentResponse(comment, isLikedByMe);
    });
    res.status(200).json({
        success: true,
        data: formattedComments,
        meta: formatCursorPaginationMeta(limit, nextCursor),
    });
};
export const createComment = async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const comment = await commentService.createComment(postId, req.user.id, content);
    res.status(201).json({
        success: true,
        data: formatCommentResponse(comment, false),
    });
};
export const updateComment = async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const comment = await commentService.updateComment(commentId, req.user.id, content);
    const isLikedByMe = Boolean(comment.isLikedByMe);
    res.status(200).json({
        success: true,
        data: formatCommentResponse(comment, isLikedByMe),
    });
};
export const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    await commentService.deleteComment(commentId, req.user.id);
    res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
    });
};
export const likeComment = async (req, res) => {
    const { commentId } = req.params;
    const result = await likeService.likeTarget(req.user.id, 'comment', commentId);
    res.status(200).json({
        success: true,
        data: result,
    });
};
export const unlikeComment = async (req, res) => {
    const { commentId } = req.params;
    const result = await likeService.unlikeTarget(req.user.id, 'comment', commentId);
    res.status(200).json({
        success: true,
        data: result,
    });
};
export const getCommentLikers = async (req, res) => {
    const { commentId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;
    const currentUserId = req.user?.id;
    const { users, nextCursor } = await likeService.getLikers('comment', commentId, limit, cursor, currentUserId);
    const formattedUsers = users.map((user) => formatUserResponse(user));
    res.status(200).json({
        success: true,
        data: formattedUsers,
        meta: formatCursorPaginationMeta(limit, nextCursor),
    });
};
//# sourceMappingURL=comment.controller.js.map