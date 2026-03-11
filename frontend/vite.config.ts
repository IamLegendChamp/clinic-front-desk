/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import federation from '@originjs/vite-plugin-federation';

const sharedRemoteUrl =
  process.env.VITE_SHARED_REMOTE_URL ?? 'http://localhost:5174/remoteEntry.js';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ...(process.env.VITEST
      ? []
      : [
          federation({
            name: 'host',
            remotes: {
              shared: sharedRemoteUrl,
            },
            shared: ['react', 'react-dom'],
          }),
        ]),
  ] as any,
  resolve: {
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled', '@mui/material'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e/**'],
  },
});
