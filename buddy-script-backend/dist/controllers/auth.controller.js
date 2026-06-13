import { authService } from '../services/auth.service.js';
import { formatUserResponse } from '../utils/helpers.js';
export const register = async (req, res) => {
    const user = await authService.register(req.body);
    req.session.userId = user.id.toString();
    res.status(201).json({
        success: true,
        data: {
            user: formatUserResponse(user),
        },
    });
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    const user = await authService.login(email, password, ipAddress, userAgent);
    // Regenerate session to prevent session fixation
    await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
            if (err)
                reject(err);
            else
                resolve();
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
export const logout = async (req, res) => {
    await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
    res.clearCookie(process.env.SESSION_NAME || 'sessionId', {
        domain: process.env.SESSION_COOKIE_DOMAIN || undefined,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.SESSION_COOKIE_SAME_SITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax')),
    });
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};
export const getMe = async (req, res) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        data: {
            user: formatUserResponse(user),
        },
    });
};
//# sourceMappingURL=auth.controller.js.map