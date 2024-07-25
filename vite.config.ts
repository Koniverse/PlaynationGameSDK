import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dts()],
  build: {
    target: 'es2015',
    lib: {
      name: 'PlaynationSDK',
      entry: {
        utils: 'src/utils/index.ts',
        websdk: 'src/websdk.ts',
      },
    },
    outDir: 'dist',
  },
});
