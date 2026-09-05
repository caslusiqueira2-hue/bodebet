import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
  ],
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://bodebet.vercel.app',
        changeOrigin: true,
      },
      '/gold_api': {
        target: 'https://bodebet.vercel.app',
        changeOrigin: true,
      },
      '/web-api': {
        target: 'https://bodebet.vercel.app',
        changeOrigin: true,
      },
      '/game-api': {
        target: 'https://bodebet.vercel.app',
        changeOrigin: true,
      },
      '^/(126|98|68|1543462|1695365|40|42|48|63|69|125|shared|tools|uma|favicon|gtm.js)': {
        target: 'https://bodebet.vercel.app',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
