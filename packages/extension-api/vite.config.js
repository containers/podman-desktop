/* eslint-env node */
import {join} from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

const PACKAGE_ROOT = __dirname;


// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
    },
  },
  plugins: [svelte()],
  optimizeDeps: {
    exclude: ['tinro'],
  },
  base: '',
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    assetsDir: '.',
    
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  test: {
    coverage: {
      all: true,
      src: ['src'],
      clean: true,
      exclude: [
        '**/builtin/**',
        '**/cypress/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '**/*.{svelte,tsx,cjs,js,d.ts}',
        '**/*-info.ts',
        '**/.{cache,git,idea,output,temp,cdix}/**',
        '**/*{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tailwind,postcss}.config.*',
      ],
      provider: 'c8',
      reportsDirectory: '../../test-resources/coverage/extension-api',
      reporter: ['lcov', 'json', 'text-summary'],
    },
  },
});
