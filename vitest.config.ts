import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.config.ts',
        '.next/',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
});
