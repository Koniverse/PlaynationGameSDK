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
      name: 'PlaynationGameSDK',
      entry: {
        index: 'src/index.ts'
      },
    },
    outDir: 'dist',
    rollupOptions: {
      preserveEntrySignatures: "strict",
      output: [
        {
          preserveModules: true,
          preserveModulesRoot: "src",
          format: 'es',
          entryFileNames: ({name: fileName}) => {
            return `${fileName}.js`;
          },
        }
      ],
      external: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.peerDependencies)
      ],
    },
  },
});
