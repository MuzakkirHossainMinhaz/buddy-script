import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { redisStore } from './config/redis.config.js';
import { swaggerSpec } from './config/swagger.config.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { requestLogger } from './middlewares/logging.middleware.js';
import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';
import { uploadsDir } from './middlewares/upload.middleware.js';
import routes from './routes/index.js';
import { connectRedis } from './config/redis.config.js';
const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const requiredProductionEnv = [
    'DATABASE_URL',
    'REDIS_URL',
    'SESSION_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
];
if (isProduction) {
    const missingEnv = requiredProductionEnv.filter((name) => !process.env[name]);
    if (missingEnv.length > 0) {
        throw new Error(`Missing required production environment variables: ${missingEnv.join(', ')}`);
    }
}
// Trust proxy only when explicitly configured by the deployment.
const trustProxy = process.env.TRUST_PROXY
    ? process.env.TRUST_PROXY === 'false'
        ? false
        : process.env.TRUST_PROXY === 'true'
            ? 1
            : Number(process.env.TRUST_PROXY)
    : isProduction
        ? 1
        : false;
app.set('trust proxy', trustProxy);
// Security headers
app.use(helmet());
// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
const allowedOrigins = new Set(corsOrigins.map((origin) => origin.trim()));
app.use(cors({
    origin: corsOrigins,
    credentials: true,
}));
app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        next();
        return;
    }
    const origin = req.get('origin');
    if (origin && !allowedOrigins.has(origin)) {
        res.status(403).json({ success: false, error: 'Origin not allowed' });
        return;
    }
    next();
});
// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.get('/', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'buddy-script-backend',
    });
});
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});
// Locally uploaded post images
app.use('/uploads', express.static(uploadsDir, {
    fallthrough: false,
    maxAge: isProduction ? '7d' : 0,
}));
// Session middleware
const sameSite = (process.env.SESSION_COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax'));
app.use('/api', async (_req, _res, next) => {
    try {
        await connectRedis();
        next();
    }
    catch (error) {
        next(error);
    }
});
app.use(session({
    store: redisStore,
    secret: process.env.SESSION_SECRET || 'development-session-secret',
    name: process.env.SESSION_NAME || 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
}));
// Request logging
app.use(requestLogger);
// API rate limiter (global for all /api routes)
app.use('/api', apiRateLimiter);
// API routes
app.use('/api', routes);
// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// 404 handler for unmatched routes
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});
// Global error handler (MUST be last middleware)
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map