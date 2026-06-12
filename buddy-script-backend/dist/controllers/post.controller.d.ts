import { Request, Response } from 'express';
export declare const getPublicFeed: (req: Request, res: Response) => Promise<void>;
export declare const getMyPosts: (req: Request, res: Response) => Promise<void>;
export declare const getPost: (req: Request, res: Response) => Promise<void>;
export declare const createPost: (req: Request, res: Response) => Promise<void>;
export declare const updatePost: (req: Request, res: Response) => Promise<void>;
export declare const deletePost: (req: Request, res: Response) => Promise<void>;
export declare const likePost: (req: Request, res: Response) => Promise<void>;
export declare const unlikePost: (req: Request, res: Response) => Promise<void>;
export declare const getPostLikers: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=post.controller.d.ts.map