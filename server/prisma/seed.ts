import { PrismaClient } from '@prisma/client';

import games from '../game.json';
const prisma = new PrismaClient();

type Game = {
  id: string;
  isActive: boolean;
  createdAt: string;
  name: string;
};

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
