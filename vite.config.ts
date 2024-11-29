import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { resolve } from 'path';
export default defineConfig({

  plugins: [
    TanStackRouterVite(),
    viteReact(),
    svgr(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})