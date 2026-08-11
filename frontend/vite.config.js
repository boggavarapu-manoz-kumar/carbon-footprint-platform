import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectManifest: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        enabled: true, // Enable PWA in dev mode for testing
        type: 'module',
      },
      manifest: {
        name: 'Carbon Footprint Platform',
        short_name: 'CarbonApp',
        description: 'Track, manage, and reduce your carbon footprint.',
        theme_color: '#10b981', // emerald-500
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React runtime — smallest possible, longest cache life
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }
          // Router + data-fetching — changes more often than React core
          if (
            id.includes('node_modules/react-router-dom/') ||
            id.includes('node_modules/react-router/') ||
            id.includes('node_modules/@tanstack/react-query/')
          ) {
            return 'query-vendor';
          }
          // HTTP client
          if (id.includes('node_modules/axios/')) {
            return 'http-vendor';
          }
          // Recharts (large — isolated for separate caching)
          if (
            id.includes('node_modules/recharts/') ||
            id.includes('node_modules/d3') ||
            id.includes('node_modules/victory-vendor')
          ) {
            return 'chart-vendor';
          }
          // PDF / screenshot — only downloaded when user generates a report
          if (
            id.includes('node_modules/jspdf/') ||
            id.includes('node_modules/html2canvas/')
          ) {
            return 'pdf-vendor';
          }
          // MUI + emotion runtime
          if (
            id.includes('node_modules/@mui/') ||
            id.includes('node_modules/@emotion/')
          ) {
            return 'mui-vendor';
          }
          // Other large UI libs
          if (
            id.includes('node_modules/antd/') ||
            id.includes('node_modules/rc-') ||
            id.includes('node_modules/framer-motion/') ||
            id.includes('node_modules/lucide-react/')
          ) {
            return 'ui-vendor';
          }
        }
      }
    }
  }
});
