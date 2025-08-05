import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  publicDir: './public',
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  plugins: [
    tailwindcss(),
  ]
});