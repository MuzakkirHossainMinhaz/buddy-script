export declare class AuthService {
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
    register(data: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }): Promise<{
        id: bigint;
        uuid: string;
        email: string;
        firstName: string;
        lastName: string;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        loginAttempts: number;
        lockedUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
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
    login(email: string, password: string, ipAddress: string, userAgent: string): Promise<{
        id: bigint;
        uuid: string;
        email: string;
        firstName: string;
        lastName: string;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        loginAttempts: number;
        lockedUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Fetch a user by internal BigInt ID.
     *
     * @throws {NotFoundError} if no user exists with the given ID
     */
    getUserById(userId: bigint): Promise<{
        id: bigint;
        uuid: string;
        email: string;
        firstName: string;
        lastName: string;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        loginAttempts: number;
        lockedUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Fetch a user by public UUID.
     *
     * @throws {NotFoundError} if no user exists with the given UUID
     */
    getUserByUuid(uuid: string): Promise<{
        id: bigint;
        uuid: string;
        email: string;
        firstName: string;
        lastName: string;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        loginAttempts: number;
        lockedUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map