import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { assertCanViewPost, type VisibilityPost } from '../utils/visibility.js';

export class VisibilityService {
  assertCanViewPost = assertCanViewPost;

  async getVisiblePostByUuid(postUuid: string, currentUserId?: bigint) {
    const post = await prisma.post.findUnique({
      where: { uuid: postUuid },
      include: {
        user: {
          select: {
            id: true,
            uuid: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    assertCanViewPost(post, currentUserId);
    return post;
  }

  async getVisibleCommentByUuid(commentUuid: string, currentUserId?: bigint) {
    const comment = await prisma.comment.findUnique({
      where: { uuid: commentUuid },
      include: { post: true },
    });

    if (!comment || comment.isDeleted) {
      throw new NotFoundError('Comment');
    }

    assertCanViewPost(comment.post as VisibilityPost, currentUserId);
    return comment;
  }

  async getVisibleReplyByUuid(replyUuid: string, currentUserId?: bigint) {
    const reply = await prisma.reply.findUnique({
      where: { uuid: replyUuid },
      include: {
        comment: {
          include: { post: true },
        },
      },
    });

    if (!reply || reply.isDeleted) {
      throw new NotFoundError('Reply');
    }

    assertCanViewPost(reply.comment.post as VisibilityPost, currentUserId);
    return reply;
  }
}

export const visibilityService = new VisibilityService();
