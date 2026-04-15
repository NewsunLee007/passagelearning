import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500, // 提升警告阈值到 1500kb
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 React 核心库拆分到独立的 vendor chunk
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
})
