import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          devOptions: { enabled: false },
          includeAssets: ['favicon.svg', 'robots.txt', 'icons/*'],
          manifest: {
            name: 'GID — Get It Done',
            short_name: 'GID',
            description: 'Local-first note, kanban and mindmap app.',
            theme_color: '#4A90E2',
            background_color: '#4A90E2',
            start_url: '/',
            display: 'standalone',
            icons: [
              { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
              { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
            ]
          },
          workbox: {
            cleanupOutdatedCaches: true,
            navigateFallback: '/offline.html',
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-stylesheets',
                  expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
                }
              },
              {
                urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: { cacheName: 'cdn-js' }
              },
              {
                urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: { cacheName: 'tailwind-cdn' }
              },
              {
                urlPattern: /^https:\/\/accounts\.google\.com\/.*/i,
                handler: 'NetworkFirst',
                options: { cacheName: 'google-auth', networkTimeoutSeconds: 10 }
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
