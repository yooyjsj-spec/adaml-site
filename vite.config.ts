import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // HashRouter를 사용하므로 상대 경로('./')를 사용하여 
  // GitHub Pages의 서브 디렉토리(/repo-name/)에서도 정상 작동하도록 설정합니다.
  base: './', 
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
});