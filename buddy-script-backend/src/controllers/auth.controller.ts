import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { formatUserResponse } from '../utils/helpers.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  const user = await authService.register(req.body);

  req.session.userId = user.id.toString();

  res.status(201).json({
    success: true,
    data: {
      user: formatUserResponse(user),
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const ipAddress = req.ip || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';

  const user = await authService.login(email, password, ipAddress, userAgent);

  // Regenerate session to prevent session fixation
  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  req.session.userId = user.id.toString();

  res.status(200).json({
    success: true,
    data: {
      user: formatUserResponse(user),
    },
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  res.clearCookie(process.env.SESSION_NAME || 'sessionId');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;

  res.status(200).json({
    success: true,
    data: {
      user: formatUserResponse(user),
    },
  });
};
