import { NextFunction, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

import { signToken } from '../helpers/jwt';

const prisma = new PrismaClient();

export default class AuthController {
  static async login(req: Request<unknown, unknown, { username: string }>, res: Response, next: NextFunction) {
    try {
      const { username } = req.body;
      const user = await prisma.user.upsert({
        where: { username },
        create: { username },
        update: {},
      });

      const access_token = signToken({
        id: user.id,
        username: user.username,
      });

      res.status(200).json({ access_token, username: user.username });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
