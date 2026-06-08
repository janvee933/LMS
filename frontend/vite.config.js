import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // This will force Vite to open the system's default browser (e.g., Chrome/Edge) instead of VS Code's internal browser
    proxy: {
      '/api': {
        target: 'https://lms-awza.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Ensure /api is preserved correctly
      },
      '/uploads': {
        target: 'https://lms-awza.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
