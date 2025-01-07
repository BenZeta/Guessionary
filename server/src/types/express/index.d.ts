import 'express';

declare global {
  namespace Express {
    interface Request {
      loginInfo?: {
        username: string;
        userId: string;
      };
    }
  }
}
