import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['src/**/*.test.ts', 'shared/**/*.test.ts', 'server/**/*.test.ts'], environment: 'node' } });
