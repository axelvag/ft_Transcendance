import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import svgLoader from 'vite-svg-loader';
import autoprefixer from 'autoprefixer';
import fs from 'fs';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [svgLoader()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/scss/_base";
        `,
      },
    },
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  server: {
    host: true,
    port: '8000',
    https: process.env.NODE_ENV === 'development' && {
      key: fs.readFileSync('/etc/ssl/private/nginx-selfsigned.key'),
      cert: fs.readFileSync('/etc/ssl/certs/nginx-selfsigned.crt'),
    },
    watch: {
      usePolling: true,
    },
  },
});
