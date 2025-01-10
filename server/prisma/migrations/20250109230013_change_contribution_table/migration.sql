-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_userId_fkey";

-- DropIndex
DROP INDEX "Contribution_id_key";

-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "originalWordId" TEXT,
ADD COLUMN     "targetUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_originalWordId_fkey" FOREIGN KEY ("originalWordId") REFERENCES "Contribution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
