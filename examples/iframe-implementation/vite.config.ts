import path from 'path';
import {ConfigEnv, defineConfig, UserConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({mode}: ConfigEnv) => {
  const config: UserConfig = {
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
  }

  if (mode === 'source') {
    config.resolve = {
      alias: {
        '@playnation/game-sdk': path.resolve(__dirname, '../../src'),
      }
    }
  }
  
  return config;
});
