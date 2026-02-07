import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/assembly-api': {
        target: 'https://api.assemblyai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/assembly-api/, '')
      },
      // Trefle API proxy: tarayıcı CORS engelini aşmak için
      '/trefle': {
        target: 'https://trefle.io/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/trefle/, '')
      }
    }
  }
})
