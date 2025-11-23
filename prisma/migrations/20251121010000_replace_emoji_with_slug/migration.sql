-- Replace emoji field with slug for URL-safe chapter identifiers
-- This migration corrects the initial schema design to use slugs instead of emojis
-- IMPORTANT: This assumes either no chapters exist yet, or that existing chapters
-- will be manually updated with proper slugs after this migration runs

-- AlterTable: Add slug column as nullable first
ALTER TABLE "Chapter" ADD COLUMN "slug" TEXT;

-- Update existing rows to set slug (using a default pattern or leave NULL if no chapters exist)
-- If chapters exist, this would need to be populated with actual values
-- For now, we'll set a default value based on the id
UPDATE "Chapter" SET "slug" = LOWER(SUBSTRING("id" FROM 1 FOR 4)) WHERE "slug" IS NULL;

-- Make slug NOT NULL now that all rows have values
ALTER TABLE "Chapter" ALTER COLUMN "slug" SET NOT NULL;

-- Drop the emoji column
ALTER TABLE "Chapter" DROP COLUMN "emoji";

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_slug_key" ON "Chapter"("slug");
