import { NextFunction, Request, Response } from 'express';

import { signToken } from '../helpers/jwt';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class AuthController {
  static async login(req: Request<unknown, unknown, { username: string; avatar: string }>, res: Response, next: NextFunction) {
    try {
      const { username, avatar } = req.body;
      const user = await prisma.user.upsert({
        where: { username },
        create: { username, avatar },
        update: {},
      });

      const access_token = signToken({
        userId: user.id,
        username: user.username,
      });

      res.status(200).json({ access_token, user });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.loginInfo?.userId;

      await prisma.user.delete({
        where: {
          id: userId,
        },
      });

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
