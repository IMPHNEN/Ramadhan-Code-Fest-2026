
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: {
    include: ['@testing-library/jest-dom'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['**/*.test.tsx', '**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.next', 'out'],
    coverage: {
      provider: 'v8', // Explicitly set the provider
      reporter: ['text', 'json', 'html'], // Example reporters
      exclude: ['node_modules/', '.next/', 'out/', 'vitest.config.ts', '**/*.d.ts'], // Exclude common files
    },
  },
});
