import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'es2015',
    lib: {
      name: 'sdk',
      entry: {
        utils: 'src/utils/index.ts',
        sdk: 'src/websdk.ts',
      },
    },
    outDir: 'dist',
  },
});
