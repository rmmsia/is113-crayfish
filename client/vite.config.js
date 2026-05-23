import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3001',
      '/profile': 'http://localhost:3001',
      '/invite': 'http://localhost:3001',
      '/posts': 'http://localhost:3001',
      '/usertree': 'http://localhost:3001'
    }
  }
})
