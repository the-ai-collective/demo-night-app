import { type Session } from 'next-auth';
import { appRouter } from '~/server/api/root';
import { db } from '~/server/db';
import { mockDeep } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';

/**
 * Creates a tRPC caller for testing with mocked dependencies
 */
export function createCaller(opts: {
  session?: Session | null;
}) {
  // Create a minimal context for testing
  // db is already mocked globally in setup.ts
  const ctx = {
    session: opts.session ?? null,
    db,
    headers: new Headers(),
  };

  return appRouter.createCaller(ctx);
}

/**
 * Creates a mock Prisma client for testing
 */
export function createMockDb() {
  return mockDeep<PrismaClient>();
}

/**
 * Creates a mock session for authenticated tests
 */
export function createMockSession(overrides?: Partial<Session>): Session {
  return {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}
