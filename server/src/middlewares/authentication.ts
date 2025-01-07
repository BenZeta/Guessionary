import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../helpers/jwt';

export const authentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw { name: 'Unauthorized' };

    const token = authorization.split(' ')[1];
    const payload = verifyToken(token);

    if (typeof payload === 'object' && 'username' in payload) {
      req.loginInfo = {
        username: payload.username,
        userId: payload.userId,
      };
      next();
    } else {
      throw { name: 'Unauthorized' };
    }
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
