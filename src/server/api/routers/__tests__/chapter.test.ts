import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCaller, createMockSession } from '~/test/utils/trpc';
import { createMockChapter, createMockEvent } from '~/test/utils/factories';
import { db } from '~/server/db';

// Get the mocked db instance
vi.mocked(db);

describe('chapterRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all chapters ordered by name', async () => {
      const chapters = [
        createMockChapter({ id: '1', name: 'San Francisco', slug: 'sf' }),
        createMockChapter({ id: '2', name: 'New York', slug: 'ny' }),
        createMockChapter({ id: '3', name: 'London', slug: 'london' }),
      ];

      vi.mocked(db.chapter.findMany).mockResolvedValue(
        chapters.map((ch) => ({
          ...ch,
          _count: { events: 5 },
        })) as any,
      );

      const caller = createCaller({});
      const result = await caller.chapter.getAll();

      expect(result).toHaveLength(3);
      expect(db.chapter.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: {
              events: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('should return empty array when no chapters exist', async () => {
      vi.mocked(db.chapter.findMany).mockResolvedValue([]);

      const caller = createCaller({});
      const result = await caller.chapter.getAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should return chapter with events by ID', async () => {
      const chapter = createMockChapter({ id: 'chapter-1', name: 'San Francisco' });
      const events = [
        createMockEvent({ id: 'event-1', chapterId: 'chapter-1' }),
        createMockEvent({ id: 'event-2', chapterId: 'chapter-1' }),
      ];

      vi.mocked(db.chapter.findUnique).mockResolvedValue({
        ...chapter,
        events,
      } as any);

      const caller = createCaller({});
      const result = await caller.chapter.getById('chapter-1');

      expect(result?.id).toBe('chapter-1');
      expect(result?.events).toHaveLength(2);
      expect(db.chapter.findUnique).toHaveBeenCalledWith({
        where: { id: 'chapter-1' },
        include: {
          events: {
            orderBy: {
              date: 'desc',
            },
          },
        },
      });
    });

    it('should return null for non-existent chapter', async () => {
      vi.mocked(db.chapter.findUnique).mockResolvedValue(null);

      const caller = createCaller({});
      const result = await caller.chapter.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create - input validation', () => {
    it('should reject empty name', async () => {
      const session = createMockSession();
      const caller = createCaller({ session });

      await expect(
        caller.chapter.create({ name: '', slug: 'sf' })
      ).rejects.toThrow();
    });

    it('should reject empty slug', async () => {
      const session = createMockSession();
      const caller = createCaller({ session });

      await expect(
        caller.chapter.create({ name: 'San Francisco', slug: '' })
      ).rejects.toThrow();
    });
  });
});
