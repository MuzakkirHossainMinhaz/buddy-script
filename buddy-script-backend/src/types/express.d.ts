import 'express-serve-static-core';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: bigint;
      uuid: string;
      firstName: string;
      lastName: string;
      email: string;
      isActive: boolean;
      isVerified: boolean;
    };
  }
}
