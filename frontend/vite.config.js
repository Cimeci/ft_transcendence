import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  publicDir: './public',
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/auth': 'http://backend_gateway:443',
      '/user': 'http://backend_gateway:443',
      '/game': 'http://backend_gateway:443',
      '/tournament': 'http://backend_gateway:443',
      '/ws': { target: 'ws://backend_websocket:4000', ws: true, changeOrigin: true },
    },
    allowedHosts: true,
    cors: true
  },
  plugins: [
    tailwindcss(),
  ]
});
