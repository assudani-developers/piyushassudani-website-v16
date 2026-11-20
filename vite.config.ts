import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { seo } from './seo';

export default defineConfig({
  plugins: [seo()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
      },
    },
  },
});
