import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: true,
  }
});
