import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'shared' },
    rollupOptions: {
      output: {
        entryFileNames: 'remoteEntry.js',
        format: 'es',
      },
    },
  },
  plugins: [
    federation({
      name: 'shared',
      filename: 'remoteEntry.js',
      exposes: {
        './auth': './src/auth.ts',
        './api': './src/axios.ts',
        './config': './src/config.ts',
        '.': './src/index.ts',
      },
      shared: [],
    }),
  ],
});
