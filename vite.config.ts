import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        outDir: 'dist',
        sourcemap: false, // Disable sourcemaps to reduce build size for Vercel
        minify: 'esbuild', // Use esbuild for faster minification
      },
      // Prevent Vercel from serving service worker as HTML
      ssr: {
        noExternal: [] // No external packages needed for SSR
      }
    };
});
