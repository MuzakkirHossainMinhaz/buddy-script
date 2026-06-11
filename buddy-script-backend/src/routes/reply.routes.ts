import { Router } from 'express';
import * as replyController from '../controllers/reply.controller.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { CreateReplySchema, UpdateReplySchema } from '../schemas/reply.schema.js';
import { PaginationQuerySchema } from '../schemas/pagination.schema.js';

// Router for comment-scoped reply operations (mounted at /api/comments/:commentId/replies)
const commentReplyRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /api/comments/{commentId}/replies:
 *   get:
 *     summary: Get replies for a comment
 *     tags: [Replies]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Comment UUID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *           default: newest
 *     responses:
 *       200:
 *         description: List of replies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ReplyResponse'
 *                 meta:
 *                   $ref: '#/components/schemas/CursorPaginationMeta'
 */
commentReplyRouter.get('/', optionalAuth, validate(PaginationQuerySchema, 'query'), replyController.getReplies);

/**
 * @swagger
 * /api/comments/{commentId}/replies:
 *   post:
 *     summary: Create a reply to a comment
 *     tags: [Replies]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 2000
 *               parentReplyId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional parent reply ID for nested replies
 *     responses:
 *       201:
 *         description: Reply created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ReplyResponse'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Comment not found
 */
commentReplyRouter.post('/', requireAuth, validate(CreateReplySchema), replyController.createReply);

// Router for direct reply operations (mounted at /api/replies)
const replyRouter = Router();

/**
 * @swagger
 * /api/replies/{replyId}:
 *   put:
 *     summary: Update a reply
 *     tags: [Replies]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 2000
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ReplyResponse'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this reply
 *       404:
 *         description: Reply not found
 */
replyRouter.put('/:replyId', requireAuth, validate(UpdateReplySchema), replyController.updateReply);

/**
 * @swagger
 * /api/replies/{replyId}:
 *   delete:
 *     summary: Delete a reply
 *     tags: [Replies]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reply deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this reply
 *       404:
 *         description: Reply not found
 */
replyRouter.delete('/:replyId', requireAuth, replyController.deleteReply);

/**
 * @swagger
 * /api/replies/{replyId}/like:
 *   post:
 *     summary: Like a reply
 *     tags: [Replies]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reply liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 *                     likeCount:
 *                       type: integer
 *       401:
 *         description: Not authenticated
 */
replyRouter.post('/:replyId/like', requireAuth, replyController.likeReply);

/**
 * @swagger
 * /api/replies/{replyId}/like:
 *   delete:
 *     summary: Unlike a reply
 *     tags: [Replies]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reply unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 *                     likeCount:
 *                       type: integer
 *       401:
 *         description: Not authenticated
 */
replyRouter.delete('/:replyId/like', requireAuth, replyController.unlikeReply);

/**
 * @swagger
 * /api/replies/{replyId}/likes:
 *   get:
 *     summary: Get users who liked a reply
 *     tags: [Replies]
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of users who liked the reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserResponse'
 *                 meta:
 *                   $ref: '#/components/schemas/CursorPaginationMeta'
 */
replyRouter.get(
  '/:replyId/likes',
  optionalAuth,
  validate(PaginationQuerySchema, 'query'),
  replyController.getReplyLikers,
);

export { commentReplyRouter, replyRouter };
