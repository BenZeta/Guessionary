import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class GameController {
  static async startGame(req: Request<{ roomId: string; gameId: string }>, res: Response, next: NextFunction) {
    try {
      const { roomId, gameId } = req.params;

      const room = await prisma.room.findUnique({
        where: {
          id: roomId,
        },
        include: {
          users: true,
        },
      });
      if (!room) throw { name: 'NotFound', message: 'Data not Found' };

      await prisma.room.update({
        where: {
          id: roomId,
        },
        data: {
          gameId,
        },
      });

      const userIds = room.users.map((user) => user.id); // Extract user IDs

      await prisma.user.updateMany({
        where: {
          id: {
            in: userIds, // Update only the users in the room
          },
        },
        data: {
          gameId,
        },
      });

      res.status(200).json({
        message: 'Game is starting..',
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async postGameRound1(req: Request<{ gameId: string; roomId: string }, unknown, { words: string }>, res: Response, next: NextFunction) {
    try {
      const { words } = req.body;
      const userId = req.loginInfo?.userId;
      const { gameId, roomId } = req.params;
      console.log(gameId, '<<<', roomId);

      const game = await prisma.game.findUnique({ where: { id: gameId } });
      if (!game) throw { name: 'NotFound', message: 'Data not found' };

      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) throw { name: 'NotFound', message: 'Data not found' };

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw { name: 'NotFound', message: 'Data not found' };

      const contributionWord = await prisma.contribution.create({
        data: {
          roomId,
          gameId,
          userId: userId!,
          type: 'WORD',
          content: words,
        },
      });

      res.status(201).json(contributionWord);
    } catch (error) {
      next(error);
      console.log(error);
    }
  }

  static async postGameRound2(req: Request<{ gameId: string; roomId: string }, unknown, { user64: string }>, res: Response, next: NextFunction) {
    try {
      const { user64 } = req.body;
      const userId = req.loginInfo?.userId;
      const { gameId, roomId } = req.params;

      const room = await prisma.room.findUnique({
        where: {
          id: roomId,
        },
        include: {
          users: true,
        },
      });
      if (!room) throw { name: 'NotFound', message: 'Data not Found' };

      const gameRound2 = await prisma.contribution.create({
        data: {
          roomId,
          userId: userId!,
          gameId: gameId,
          type: 'DRAWING',
          content: user64,
        },
      });

      res.status(201).json({
        message: 'successfully submit image',
        dataRound2: gameRound2,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async getGames(req: Request, res: Response, next: NextFunction) {
    try {
      const games = await prisma.game.findMany();

      res.status(200).json(games);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
