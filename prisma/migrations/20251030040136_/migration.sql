/*
  Warnings:

  - A unique constraint covering the columns `[eventId,attendeeId,awardId,demoId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Vote_eventId_attendeeId_awardId_key";

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "amount" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Vote_eventId_attendeeId_awardId_demoId_key" ON "Vote"("eventId", "attendeeId", "awardId", "demoId");
