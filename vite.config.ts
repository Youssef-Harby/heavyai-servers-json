import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import tailwind from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/heavyai-servers-json/', // Base path for GitHub Pages
  plugins: [
    vue(),
    tailwind(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
