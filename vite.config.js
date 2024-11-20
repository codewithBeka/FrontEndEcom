import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
        input: {
            main: 'index.html',
            sw: 'public/firebase-messaging-sw.js' // Ensure your SW is included
        }
    }
},
  server: {
    proxy: {
      "/api/": "http://localhost:8000",
      "/uploads/": "http://localhost:8000",
    },
  },
})
