import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config. The dev server runs on 5173 and proxies /api calls to
// the Express backend on 5000, so the client can use relative URLs.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
