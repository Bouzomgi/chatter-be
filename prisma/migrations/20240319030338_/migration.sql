/*
  Warnings:

  - You are about to drop the column `fromUserId` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[conversationId,member]` on the table `Thread` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fromUser` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member` to the `Thread` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_fromUserId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "fromUserId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fromUser" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "member" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Thread_conversationId_member_key" ON "Thread"("conversationId", "member");

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_member_fkey" FOREIGN KEY ("member") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_fromUser_fkey" FOREIGN KEY ("fromUser") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
