import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'es2015',
    lib: {
      formats: ['es', 'cjs', "iife"],
      name: 'PlaynationGameSDK',
      entry: {
        sdk: 'src/sdk.ts'
      },
    },
    outDir: 'browser'
  },
});
