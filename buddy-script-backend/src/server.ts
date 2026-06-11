import 'dotenv/config';
import app from './app.js';
import { logger } from './config/logger.config.js';
import { connectRedis, disconnectRedis } from './config/redis.config.js';
import { disconnectDatabase } from './config/database.js';

// BigInt JSON serialization safety net
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer(): Promise<void> {
  try {
    // Connect to Redis
    await connectRedis();
    logger.info('Connected to Redis');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API docs available at http://localhost:${PORT}/api-docs`);
      logger.info(`Health check at http://localhost:${PORT}/health`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await disconnectDatabase();
          logger.info('Database disconnected');

          await disconnectRedis();
          logger.info('Redis disconnected');

          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown', { error });
          process.exit(1);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();
