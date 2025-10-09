import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Substituir importações problemáticas por mocks
      'pg': path.resolve(__dirname, './src/mocks/pg.ts'),
      'jsonwebtoken': path.resolve(__dirname, './src/mocks/jsonwebtoken.ts'),
      'bcrypt': path.resolve(__dirname, './src/mocks/bcryptjs.ts'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
})