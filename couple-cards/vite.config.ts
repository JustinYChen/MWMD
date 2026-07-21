import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// GitHub Pages 部署:仓库名为 MWMD 时生产环境 base 为 '/MWMD/'
// 若仓库名不同,请修改此处;若部署到 user.github.io 顶级仓库则改为 '/'
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/MWMD/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          motion: ['framer-motion', 'gsap', '@gsap/react'],
        },
      },
    },
  },
}))
