import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // This repository is published as a GitHub Pages project site at /site/.
  base: '/site/',
  plugins: [vue()],
})
