import { cloudinaryService } from '../services/cloudinary.service.js';
import { likeService } from '../services/like.service.js';
import { postService } from '../services/post.service.js';
import { formatCursorPaginationMeta, formatPostResponse, formatUserResponse, } from '../utils/helpers.js';
import { ValidationError } from '../utils/errors.js';
export const getPublicFeed = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const sort = (req.query.sort || 'newest');
    const cursor = req.query.cursor;
    const currentUserId = req.user?.id;
    const { posts, nextCursor } = await postService.getPublicFeed(limit, sort, cursor, currentUserId);
    const formattedPosts = posts.map((post) => {
        const isLikedByMe = Boolean(post.isLikedByMe);
        return formatPostResponse(post, isLikedByMe);
    });
    res.status(200).json({
        success: true,
        data: formattedPosts,
        meta: formatCursorPaginationMeta(limit, nextCursor),
    });
};
export const getMyPosts = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const sort = (req.query.sort || 'newest');
    const cursor = req.query.cursor;
    const { posts, nextCursor } = await postService.getMyPosts(req.user.id, limit, sort, cursor);
    const formattedPosts = posts.map((post) => {
        const isLikedByMe = Boolean(post.isLikedByMe);
        return formatPostResponse(post, isLikedByMe);
    });
    res.status(200).json({
        success: true,
        data: formattedPosts,
        meta: formatCursorPaginationMeta(limit, nextCursor),
    });
};
export const getPost = async (req, res) => {
    const { postId } = req.params;
    const currentUserId = req.user?.id;
    const post = await postService.getPostByUuid(postId, currentUserId);
    const isLikedByMe = Boolean(post.isLikedByMe);
    res.status(200).json({
        success: true,
        data: formatPostResponse(post, isLikedByMe),
    });
};
export const createPost = async (req, res) => {
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    let imageUrl = req.body.imageUrl;
    if (req.file) {
        // Upload image buffer directly to Cloudinary (stateless: no local disk writes)
        imageUrl = await cloudinaryService.uploadImageBuffer(req.file.buffer);
    }
    if (!content && !imageUrl) {
        throw new ValidationError('Post must include text or an image');
    }
    const post = await postService.createPost(req.user.id, {
        ...req.body,
        content,
        imageUrl,
        privacyType: req.body.privacyType,
    });
    res.status(201).json({
        success: true,
        data: formatPostResponse(post, false),
    });
};
export const updatePost = async (req, res) => {
    const { postId } = req.params;
    const post = await postService.updatePost(postId, req.user.id, {
        ...req.body,
        privacyType: req.body.privacyType,
    });
    const isLikedByMe = Boolean(post.isLikedByMe);
    res.status(200).json({
        success: true,
        data: formatPostResponse(post, isLikedByMe),
    });
};
export const deletePost = async (req, res) => {
    const { postId } = req.params;
    await postService.deletePost(postId, req.user.id);
    res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
    });
};
export const likePost = async (req, res) => {
    const { postId } = req.params;
    const result = await likeService.likeTarget(req.user.id, 'post', postId);
    res.status(200).json({
        success: true,
        data: result,
    });
};
export const unlikePost = async (req, res) => {
    const { postId } = req.params;
    const result = await likeService.unlikeTarget(req.user.id, 'post', postId);
    res.status(200).json({
        success: true,
        data: result,
    });
};
export const getPostLikers = async (req, res) => {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;
    const currentUserId = req.user?.id;
    const { users, nextCursor } = await likeService.getLikers('post', postId, limit, cursor, currentUserId);
    const formattedUsers = users.map((user) => formatUserResponse(user));
    res.status(200).json({
        success: true,
        data: formattedUsers,
        meta: formatCursorPaginationMeta(limit, nextCursor),
    });
};
//# sourceMappingURL=post.controller.js.map