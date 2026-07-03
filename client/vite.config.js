import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://business-management-backend-6ug7.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
