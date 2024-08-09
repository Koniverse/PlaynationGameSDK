import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        index: 'index.html',
        iframe: 'iframe.html',
        iframe_farming: 'iframe_farming.html'
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
});
