/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import federation from '@originjs/vite-plugin-federation';

// In dev, proxy the remote through the frontend server to avoid CORS. In build (e2e/preview), use direct URL.
const sharedRemoteUrl =
  process.env.VITE_SHARED_REMOTE_URL ?? 'http://localhost:5174/assets/remoteEntry.js';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const remoteUrl = isDev ? 'http://localhost:5173/shared-remote/assets/remoteEntry.js' : sharedRemoteUrl;

  return {
    plugins: [
      react(),
      ...(process.env.VITEST
        ? []
        : [
            federation({
              name: 'host',
              remotes: {
                shared: remoteUrl,
              },
              shared: ['react', 'react-dom'],
            }),
          ]),
    ] as any,
    server: isDev
      ? {
          proxy: {
            '/shared-remote': {
              target: 'http://localhost:5174',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/shared-remote/, ''),
            },
            '/api': {
              target: 'http://localhost:5001',
              changeOrigin: true,
            },
          },
        }
      : undefined,
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
  };
});
