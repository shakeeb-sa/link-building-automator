import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import manifest from './src/manifest.json';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        popup: resolve(__dirname, 'src/popup/index.tsx'),
        content: resolve(__dirname, 'src/content/index.ts'),
        // options: resolve(__dirname, 'src/options/index.tsx'), // uncomment when needed
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'background.js';
          if (chunkInfo.name === 'popup') return 'popup.js';
          if (chunkInfo.name === 'content') return 'content.js';
          if (chunkInfo.name === 'options') return 'options.js';
          return '[name].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});