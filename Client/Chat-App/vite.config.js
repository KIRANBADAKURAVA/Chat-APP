import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://chat-app-5-hqwv.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'wss://chat-app-5-hqwv.onrender.com',
        ws: true,
      },
    },
  },
})
