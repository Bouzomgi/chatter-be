/*
  Warnings:

  - You are about to drop the `Unseen` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Unseen" DROP CONSTRAINT "Unseen_messageId_fkey";

-- DropForeignKey
ALTER TABLE "Unseen" DROP CONSTRAINT "Unseen_threadId_fkey";

-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "unseen" INTEGER;

-- DropTable
DROP TABLE "Unseen";

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_unseen_fkey" FOREIGN KEY ("unseen") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
