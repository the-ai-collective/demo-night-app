import { z } from "zod";

export const chapterSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  emoji: z.string().max(2),
  city: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  timezone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  slackUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  twitterUrl: z.string().url().optional().nullable(),
  leadName: z.string().optional().nullable(),
  leadEmail: z.string().email().optional().nullable(),
  leadLinkedin: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createChapterSchema = chapterSchema.pick({
  name: true,
  slug: true,
  emoji: true,
  city: true,
  country: true,
  timezone: true,
  email: true,
  slackUrl: true,
  linkedinUrl: true,
  twitterUrl: true,
  leadName: true,
  leadEmail: true,
  leadLinkedin: true,
  description: true,
  imageUrl: true,
});

export const updateChapterSchema = createChapterSchema.partial();

export type Chapter = z.infer<typeof chapterSchema>;
export type CreateChapter = z.infer<typeof createChapterSchema>;
export type UpdateChapter = z.infer<typeof updateChapterSchema>;

// Default chapters to seed
export const DEFAULT_CHAPTERS: CreateChapter[] = [
  {
    name: "San Francisco",
    slug: "sf",
    emoji: "🌉",
    city: "San Francisco",
    country: "United States",
    timezone: "America/Los_Angeles",
  },
  {
    name: "New York City",
    slug: "nyc",
    emoji: "🗽",
    city: "New York",
    country: "United States",
    timezone: "America/New_York",
  },
  {
    name: "Washington D.C.",
    slug: "dc",
    emoji: "🏛️",
    city: "Washington",
    country: "United States",
    timezone: "America/New_York",
  },
  {
    name: "London",
    slug: "london",
    emoji: "🇬🇧",
    city: "London",
    country: "United Kingdom",
    timezone: "Europe/London",
  },
  {
    name: "Singapore",
    slug: "singapore",
    emoji: "🏙️",
    city: "Singapore",
    country: "Singapore",
    timezone: "Asia/Singapore",
  },
];