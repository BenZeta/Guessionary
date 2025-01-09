import { PrismaClient } from '@prisma/client';
import games from '../game.json';

const prisma = new PrismaClient();

type Game = {
  id: string;
  isActive: boolean;
  createdAt: string;
  name: string;
  gameImage: string;
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
    avatar: 'https://ik.imagekit.io/3a0xukows/NFT-7.png?updatedAt=1736308208415',
    gameId: '1',
    role: 'Admin',
  },
  {
    id: '2',
    username: 'user2',
    avatar: 'https://ik.imagekit.io/3a0xukows/NFT-12.png?updatedAt=1736308213074',
    gameId: '2',
    role: 'Admin',
  },
];

async function main() {
  for (const game of games) {
    await prisma.game.create({
      data: {
        isActive: game.isActive,
        createdAt: game.createdAt,
        name: game.name,
        gameImage: game.gameImage,
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
