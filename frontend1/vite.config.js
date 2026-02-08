import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'fb83-2401-4900-8839-fd67-111b-58bd-2500-5e7d.ngrok-free.app'
    ]
  }
})
