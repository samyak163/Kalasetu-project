import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/kalasetu-frontend/", // This is the line you must add!
  plugins: [react()],
})