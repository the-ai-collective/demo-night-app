-- CreateTable for many-to-many relationship
CREATE TABLE "_ChapterToEvent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChapterToEvent_AB_unique" ON "_ChapterToEvent"("A", "B");

-- CreateIndex
CREATE INDEX "_ChapterToEvent_B_index" ON "_ChapterToEvent"("B");

-- AddForeignKey
ALTER TABLE "_ChapterToEvent" ADD CONSTRAINT "_ChapterToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChapterToEvent" ADD CONSTRAINT "_ChapterToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data from one-to-many to many-to-many
INSERT INTO "_ChapterToEvent" ("A", "B")
SELECT "chapterId", "id" FROM "Event" WHERE "chapterId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_chapterId_fkey";

-- DropIndex
DROP INDEX "Event_chapterId_idx";

-- AlterTable - drop the old column after data migration
ALTER TABLE "Event" DROP COLUMN "chapterId";
