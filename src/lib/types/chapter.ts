import { type Event } from "@prisma/client";

export type Chapter = {
  id: string;
  name: string;
  emoji: string;
};

export type ChapterCreate = {
  id?: string;
  name: string;
  emoji?: string;
};

export type EventWithChapter = Event & { chapterId?: string | null };

