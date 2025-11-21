/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Chapter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chapter_name_key" ON "Chapter"("name");
