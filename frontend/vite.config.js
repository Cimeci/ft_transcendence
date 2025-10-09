import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  publicDir: './public',
  server: {
    proxy: {
      '/auth': 'http://localhost:4443',
      '/user': 'http://localhost:4443',
      '/game': 'http://localhost:4443',
      '/tournament': 'http://localhost:4443',
      '/ws': { target: 'ws://localhost:4000', ws: true, changeOrigin: true },
    },
    allowedHosts: true,
    cors: true
  },
  plugins: [
    tailwindcss(),
  ]
});