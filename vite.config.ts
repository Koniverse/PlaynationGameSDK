import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts'
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts()
  ],
  build: {
    target: 'es2015',
    lib: {
      name: 'PlaynationSDK',
      entry: {
        index: 'src/index.ts'
      },
    },
    outDir: 'dist'
  },
});
