import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El build sale a dist/ (lo consume Capacitor para el APK).
// base relativa './' para que el APK cargue los assets con file://.
export default defineConfig({
  // base './' para el APK (file://). Para GitHub Pages se pasa APP_BASE=/agro-trace/
  base: process.env.APP_BASE || './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
