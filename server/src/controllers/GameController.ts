import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class GameController {
  static async startGame(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;

      // Fetch the room and its users
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { users: true }, // Include users in the room
      });

      console.log(room);

      if (!room) throw { name: 'NotFound', message: 'Room not found' };

      // Use a transaction to create the game and update the room
      const game = await prisma.$transaction(async (tx) => {
        // Create the game
        const createdGame = await tx.game.create({
          data: {
            isActive: true,
            createdAt: new Date(),
          },
        });

        // Update the room with the gameId
        await tx.room.update({
          where: { id: roomId },
          data: { gameId: createdGame.id },
        });

        for (const user of room.users) {
          await tx.user.update({
            where: { id: user.id },
            data: { gameId: createdGame.id },
          });
        }

        return createdGame;
      });

      const newGame = await prisma.game.findUnique({
        where: { id: game.id },
        include: {
          Room: true,
          users: true,
        },
      });

      res.status(201).json({
        message: 'Game has started',
        game: newGame,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
