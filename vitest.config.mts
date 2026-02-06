import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
