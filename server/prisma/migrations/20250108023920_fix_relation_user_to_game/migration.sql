/*
  Warnings:

  - You are about to drop the column `userId` on the `Game` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Game_userId_key";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "userId";
