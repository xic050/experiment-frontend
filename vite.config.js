import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/experiment-frontend/', // <--- 关键：必须加上这行，名字要和仓库名一致
})