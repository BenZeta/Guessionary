import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class RoomController {
  static async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.loginInfo?.username;
      if (!username) throw { name: 'Unauthorized' };

      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
      let randomLetters = '';
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        randomLetters += alphabet[randomIndex];
      }

      const { roomName } = req.body;
      if (!roomName) throw { name: 'BadRequest', message: 'Room name is required' };

      const user = await prisma.user.findUnique({
        where: { username },
      });
      if (!user) throw { name: 'Unauthorized' };

      const room = await prisma.room.create({
        data: {
          name: roomName,
          code: randomLetters,
          isActive: false, // Default value
          users: {
            connect: { id: user.id }, // Associate the user with the room
          },
        },
        include: {
          users: true, // Include the users in the response
        },
      });

      // Return the created room
      res.status(200).json(room);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}
