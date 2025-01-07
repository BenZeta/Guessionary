import { NextFunction, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class UserController {
  static async getUserByRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;

      const user = await prisma.room.findMany({
        where: {
          id: roomId,
        },
        include: {
          users: true,
        },
      });

      res.status(200).json(user);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
