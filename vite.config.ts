import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [vue()],
  server: { port: 3000 }
})
