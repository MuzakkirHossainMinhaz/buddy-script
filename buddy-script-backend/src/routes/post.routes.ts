import { Router } from 'express';
import * as postController from '../controllers/post.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadPostImage } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { PaginationQuerySchema } from '../schemas/pagination.schema.js';
import { CreatePostSchema, UpdatePostSchema } from '../schemas/post.schema.js';

const router = Router();

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get public feed of posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *           default: newest
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of posts
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
 *                     $ref: '#/components/schemas/PostResponse'
 *                 meta:
 *                   $ref: '#/components/schemas/CursorPaginationMeta'
 */
router.get('/', requireAuth, validate(PaginationQuerySchema, 'query'), postController.getPublicFeed);

/**
 * @swagger
 * /api/posts/me:
 *   get:
 *     summary: Get current user's posts
 *     tags: [Posts]
 *     security:
 *       - sessionAuth: []
 *     parameters:
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
 *         description: List of user's posts
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
 *                     $ref: '#/components/schemas/PostResponse'
 *                 meta:
 *                   $ref: '#/components/schemas/CursorPaginationMeta'
 *       401:
 *         description: Not authenticated
 */
router.get('/me', requireAuth, validate(PaginationQuerySchema, 'query'), postController.getMyPosts);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - sessionAuth: []
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
 *                 maxLength: 5000
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               privacyType:
 *                 type: string
 *                 enum: [public, private]
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PostResponse'
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  requireAuth,
  uploadPostImage.single('image'),
  validate(CreatePostSchema),
  postController.createPost,
);

/**
 * @swagger
 * /api/posts/{postId}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Post UUID
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PostResponse'
 *       404:
 *         description: Post not found
 */
router.get('/:postId', requireAuth, postController.getPost);

/**
 * @swagger
 * /api/posts/{postId}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
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
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 5000
 *               privacyType:
 *                 type: string
 *                 enum: [public, private]
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PostResponse'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this post
 *       404:
 *         description: Post not found
 */
router.put('/:postId', requireAuth, validate(UpdatePostSchema), postController.updatePost);

/**
 * @swagger
 * /api/posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post deleted successfully
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
 *         description: Not authorized to delete this post
 *       404:
 *         description: Post not found
 */
router.delete('/:postId', requireAuth, postController.deletePost);

/**
 * @swagger
 * /api/posts/{postId}/like:
 *   post:
 *     summary: Like a post
 *     tags: [Posts]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post liked successfully
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
router.post('/:postId/like', requireAuth, postController.likePost);

/**
 * @swagger
 * /api/posts/{postId}/like:
 *   delete:
 *     summary: Unlike a post
 *     tags: [Posts]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post unliked successfully
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
router.delete('/:postId/like', requireAuth, postController.unlikePost);

/**
 * @swagger
 * /api/posts/{postId}/likes:
 *   get:
 *     summary: Get users who liked a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
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
 *         description: List of users who liked the post
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
router.get(
  '/:postId/likes',
  requireAuth,
  validate(PaginationQuerySchema, 'query'),
  postController.getPostLikers,
);

export default router;
