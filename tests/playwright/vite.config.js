import { join } from 'path';
import { builtinModules } from 'module';
import typescript from '@rollup/plugin-typescript';

const PACKAGE_ROOT = __dirname;
const PACKAGE_NAME = '@podman-desktop/tests-playwright';

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
    },
  },
  plugins: [typescript()],
  build: {
    sourcemap: true,
    target: 'esnext',
    outDir: 'dist',
    assetsDir: '.',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      name: PACKAGE_NAME,
    },
    // emptyOutDir: true,
    reportCompressedSize: false,
    rollupOptions: {
      external: ['electron', '@playwright/test', ...builtinModules.flatMap(p => [p, `node:${p}`])],
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
};

export default config;
