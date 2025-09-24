import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  publicDir: './public',
  server: {
    proxy: {
      '/auth': 'http://localhost:4443',
      '/user': 'http://localhost:4443',
    },
    allowedHosts: true,
    cors: true
  },
  plugins: [
    tailwindcss(),
  ]
});