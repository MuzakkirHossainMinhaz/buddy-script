import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.config.js';
import {
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../utils/errors.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/** Fields to select when returning a user object (excludes passwordHash). */
const userSelectWithoutPassword = {
  id: true,
  uuid: true,
  firstName: true,
  lastName: true,
  email: true,
  lastLoginAt: true,
  lastLoginIp: true,
  loginAttempts: true,
  lockedUntil: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class AuthService {
  // ------------------------------------------------------------------ register
  /**
   * Register a new user.
   *
   * 1. Checks for existing email → ConflictError
   * 2. Hashes password with bcrypt
   * 3. Creates user record
   * 4. Returns user object without passwordHash
   *
   * @throws {ConflictError} if the email is already registered
   */
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(data.password, rounds);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
      },
      select: userSelectWithoutPassword,
    });

    logger.info('User registered', { userId: user.id.toString() });
    return user;
  }

  // -------------------------------------------------------------------- login
  /**
   * Authenticate a user with email & password.
   *
   * Implements brute-force protection:
   * - After {@link MAX_LOGIN_ATTEMPTS} consecutive failures the account
   *   is locked for 30 minutes.
   * - A successful login resets the attempt counter and clears the lock.
   *
   * @param email     - User's email address
   * @param password  - Plain-text password to verify
   * @param ipAddress - Client IP for audit logging
   * @param userAgent - Client User-Agent for audit logging
   *
   * @throws {UnauthorizedError}    if credentials are invalid
   * @throws {TooManyRequestsError} if the account is currently locked
   */
  async login(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check account lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new TooManyRequestsError('Account locked. Try again later.');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      const attempts = user.loginAttempts + 1;
      const lockUpdate: { lockedUntil?: Date } = {};

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        lockUpdate.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        logger.warn('Account locked due to too many failed attempts', {
          userId: user.id.toString(),
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: attempts, ...lockUpdate },
      });

      throw new UnauthorizedError('Invalid email or password');
    }

    // Successful login — reset counters
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
      select: userSelectWithoutPassword,
    });

    logger.info('User logged in', {
      userId: updatedUser.id.toString(),
      ip: ipAddress,
      userAgent,
    });

    return updatedUser;
  }

  // ------------------------------------------------------------- getUserById
  /**
   * Fetch a user by internal BigInt ID.
   *
   * @throws {NotFoundError} if no user exists with the given ID
   */
  async getUserById(userId: bigint) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelectWithoutPassword,
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  // ----------------------------------------------------------- getUserByUuid
  /**
   * Fetch a user by public UUID.
   *
   * @throws {NotFoundError} if no user exists with the given UUID
   */
  async getUserByUuid(uuid: string) {
    const user = await prisma.user.findUnique({
      where: { uuid },
      select: userSelectWithoutPassword,
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }
}

export const authService = new AuthService();
