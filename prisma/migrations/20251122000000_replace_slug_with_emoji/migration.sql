-- Replace slug field with emoji to match original requirements
-- This migration reverts the previous slug implementation back to emojis

-- Drop the unique index on slug
DROP INDEX "Chapter_slug_key";

-- Add emoji column as nullable first
ALTER TABLE "Chapter" ADD COLUMN "emoji" TEXT;

-- Migrate existing slug data to emojis with common mappings
UPDATE "Chapter" SET "emoji" = CASE
  WHEN LOWER("slug") = 'sf' OR LOWER("slug") = 'san' OR LOWER("slug") LIKE '%san%francisco%' THEN '🌉'
  WHEN LOWER("slug") = 'nyc' OR LOWER("slug") = 'ny' OR LOWER("slug") LIKE '%new%york%' THEN '🗽'
  WHEN LOWER("slug") = 'dfw' OR LOWER("slug") LIKE '%dallas%' THEN '🤠'
  WHEN LOWER("slug") = 'boston' OR LOWER("slug") LIKE '%boston%' THEN '🦞'
  WHEN LOWER("slug") = 'la' OR LOWER("slug") LIKE '%los%angeles%' THEN '🌴'
  WHEN LOWER("slug") = 'seattle' OR LOWER("slug") LIKE '%seattle%' THEN '🌲'
  WHEN LOWER("slug") = 'chicago' OR LOWER("slug") LIKE '%chicago%' THEN '🏙️'
  WHEN LOWER("slug") = 'miami' OR LOWER("slug") LIKE '%miami%' THEN '🏖️'
  WHEN LOWER("slug") = 'denver' OR LOWER("slug") LIKE '%denver%' THEN '⛰️'
  WHEN LOWER("slug") = 'austin' OR LOWER("slug") LIKE '%austin%' THEN '🎸'
  ELSE '📍'  -- Default emoji for unmapped chapters
END
WHERE "emoji" IS NULL;

-- Make emoji NOT NULL now that all rows have values
ALTER TABLE "Chapter" ALTER COLUMN "emoji" SET NOT NULL;

-- Drop the slug column
ALTER TABLE "Chapter" DROP COLUMN "slug";
