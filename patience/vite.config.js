import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Papa_Solitaire/',
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/logic/**', 'src/utils/**'],
      reporter: ['text', 'html'],
    },
  },
})
