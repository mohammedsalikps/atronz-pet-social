import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  /**
   * Relative base for builds so `dist/` works when Capacitor serves it from
   * the Android WebView's filesystem. Dev must stay on '/' — a relative base
   * breaks Vite's module transform middleware.
   */
  base: command === 'build' ? './' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
    // 5174, not 5173: Atronz Pet Health owns 5173 and both apps are often run
    // side by side.
    port: 5174,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}));
