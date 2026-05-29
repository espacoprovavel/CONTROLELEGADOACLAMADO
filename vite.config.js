import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Documentação: https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Para publicar em Firebase Hosting a base é "/". Se algum dia publicar em
  // GitHub Pages num subdiretório, mudar para "/CONTROLELEGADOACLAMADO/".
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
});
