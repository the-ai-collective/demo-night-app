import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';

// Mock the T3 env module to avoid client/server environment validation issues
vi.mock('~/env.js', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    NEXTAUTH_SECRET: 'test-secret',
    NEXTAUTH_URL: 'http://localhost:3000',
    NODE_ENV: 'test',
    RESEND_API_KEY: 'test-api-key',
    POSTGRES_URL: 'postgresql://test:test@localhost:5432/test',
    KV_URL: 'redis://localhost:6379',
    KV_REST_API_URL: 'http://localhost:6379',
    KV_REST_API_TOKEN: 'test-token',
    KV_REST_API_READ_ONLY_TOKEN: 'test-token',
  },
}));

// Create a mock Prisma client
const prismaMock = mockDeep<PrismaClient>();

// Mock the Prisma client to prevent real database connections
vi.mock('~/server/db', () => ({
  db: prismaMock,
}));

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
});

// Mock Next.js headers and cookies to avoid "outside request scope" errors
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock NextAuth getServerSession to avoid headers issues
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(() => Promise.resolve(null)),
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};
