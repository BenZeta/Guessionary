import { PrismaClient } from '@prisma/client';

import games from '../game.json';
const prisma = new PrismaClient();

type Game = {
  id: string;
  isActive: boolean;
  createdAt: string;
  name: string;
};

type User = {
  id: string;
  username: string;
  avatar: string;
  role: string;
};

const users = [
  {
    id: '1',
    username: 'user1',
    avatar: 'https://avatars.dicebear.com/api/bottts/1.svg',
    gameId: '1',
    role: 'Admin',
  },
  {
    id: '2',
    username: 'user2',
    avatar: 'https://avatars.dicebear.com/api/bottts/2.svg',
    gameId: '2',
    role: 'Admin',
  },
];

async function main() {
  games.forEach(async (game: Game) => {
    await prisma.game.create({
      data: {
        isActive: game.isActive,
        createdAt: game.createdAt,
        name: game.name,
      },
    });
  });

  users.forEach(async (user: User) => {
    await prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
      },
    });
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
