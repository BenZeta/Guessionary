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

  static async joinRoom(req: Request<unknown, unknown, { targetedRoomId: string }>, res: Response, next: NextFunction) {
    try {
      const { targetedRoomId } = req.body;

      const userId = req.loginInfo?.userId; // Ensure `req.loginInfo` is populated correctly

      console.log('Joining room with userId:', userId);

      // Find the room and include existing users
      const room = await prisma.room.findUnique({
        where: { id: targetedRoomId },
        include: {
          users: true,
        },
      });

      if (!room) {
        throw { name: 'NotFound', message: 'Room not found' };
      }

      // Check if the user is already in the room
      const userAlreadyInRoom = room.users.find((user) => user.id === userId);
      if (userAlreadyInRoom) {
        res.status(200).json({ message: 'User is already in the room' });
        return;
      }

      // Add the user to the room
      await prisma.room.update({
        where: { id: targetedRoomId },
        data: {
          users: {
            connect: { id: userId }, // Add user to the room
          },
        },
      });

      res.status(200).json({ message: 'Room joined successfully' });
    } catch (error) {
      console.log('error', error);
      next(error);
    }
  }

  static async leaveRoom(req: Request<unknown, unknown, { targetedRoomId: string }>, res: Response, next: NextFunction) {
    try {
      const { targetedRoomId } = req.body;

      const userId = req.loginInfo?.userId;

      console.log('Leaving room with userId:', userId);

      const room = await prisma.room.findUnique({
        where: { id: targetedRoomId },
        include: {
          users: true,
        },
      });

      if (!room) {
        throw { name: 'NotFound', message: 'Room not found' };
      }

      const userInRoom = room.users.find((user) => user.id === userId);
      console.log('>>>>>>>>>>>>>>>>>>>', room.users);

      console.log('USER IN ROOM', userInRoom);

      if (!userInRoom) {
        res.status(200).json({ message: 'User is not in the room' });
        return;
      }

      await prisma.room.update({
        where: { id: targetedRoomId },
        data: {
          users: {
            disconnect: { id: userId },
          },
        },
      });

      res.status(200).json({ message: 'Room left successfully' });
    } catch (error) {
      console.log('error', error);
      next(error);
    }
  }

  static async getRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await prisma.room.findMany({
        include: {
          users: true,
        },
      });

      res.status(200).json(room);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
