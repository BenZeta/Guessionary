/*
  Warnings:

  - You are about to drop the column `originalWordId` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the column `targetUserId` on the `Contribution` table. All the data in the column will be lost.
  - Added the required column `roomId` to the `Contribution` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_originalWordId_fkey";

-- DropIndex
DROP INDEX "Room_gameId_key";

-- DropIndex
DROP INDEX "User_gameId_key";

-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "originalWordId",
DROP COLUMN "targetUserId",
ADD COLUMN     "roomId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
