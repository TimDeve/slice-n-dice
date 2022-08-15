import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': "http://localhost:8090"
    }
  },
  plugins: [react()]
})
