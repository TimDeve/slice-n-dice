import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
const config = {
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
  preview: {
    port: 3001
  },
  plugins: [react()]
}

if ("VISUALIZE_DEPS" in process.env) {
  const { visualizer } = require("rollup-plugin-visualizer")

  config.plugins.push(visualizer(() => ({
    template: "sunburst",
    filename: 'deps-stats.html',
    gzipSize: true
  })))
}

export default defineConfig(config)
