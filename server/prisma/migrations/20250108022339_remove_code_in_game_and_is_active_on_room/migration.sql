/*
  Warnings:

  - You are about to drop the column `code` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Room` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Game_code_key";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "isActive";
