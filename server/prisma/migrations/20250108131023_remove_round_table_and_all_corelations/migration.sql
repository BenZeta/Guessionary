/*
  Warnings:

  - You are about to drop the column `roundId` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the `Round` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_roundId_fkey";

-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_gameId_fkey";

-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "roundId";

-- DropTable
DROP TABLE "Round";
