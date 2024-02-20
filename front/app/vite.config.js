import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import svgLoader from 'vite-svg-loader';
import autoprefixer from 'autoprefixer';

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
  },
});
