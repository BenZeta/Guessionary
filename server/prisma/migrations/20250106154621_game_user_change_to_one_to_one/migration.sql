/*
  Warnings:

  - You are about to drop the `_PlayerGames` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gameId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_PlayerGames" DROP CONSTRAINT "_PlayerGames_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlayerGames" DROP CONSTRAINT "_PlayerGames_B_fkey";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT NOT NULL DEFAULT 'https://avatars.dicebear.com/api/bottts/1.svg',
ADD COLUMN     "gameId" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'Admin';

-- DropTable
DROP TABLE "_PlayerGames";

-- CreateIndex
CREATE UNIQUE INDEX "Game_userId_key" ON "Game"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_gameId_key" ON "User"("gameId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
