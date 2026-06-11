import { Router } from 'express';
import authRoutes from './auth.routes.js';
import postRoutes from './post.routes.js';
import { postCommentRouter, commentRouter } from './comment.routes.js';
import { commentReplyRouter, replyRouter } from './reply.routes.js';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Post routes
router.use('/posts', postRoutes);

// Post-scoped comment routes
router.use('/posts/:postId/comments', postCommentRouter);

// Direct comment routes
router.use('/comments', commentRouter);

// Comment-scoped reply routes
router.use('/comments/:commentId/replies', commentReplyRouter);

// Direct reply routes
router.use('/replies', replyRouter);

export default router;
