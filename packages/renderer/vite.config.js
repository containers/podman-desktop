/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

/* eslint-env node */
import { join } from 'path';
import * as path from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { coverageConfig } from '../../vitest-shared-extensions.config';

let filename = fileURLToPath(import.meta.url);
const PACKAGE_ROOT = path.dirname(filename);
const PACKAGE_NAME = 'renderer';

// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
      '/@api/': join(PACKAGE_ROOT, '../api/src') + '/',
    },
  },
  plugins: [svelte({ hot: !process.env.VITEST }), svelteTesting()],
  optimizeDeps: {
    exclude: ['tinro'],
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globals: true,
    environment: 'jsdom',
    alias: [{ find: '@testing-library/svelte', replacement: '@testing-library/svelte/svelte5' }],
    deps: {
      inline: ['moment'],
    },
    ...coverageConfig(PACKAGE_ROOT, PACKAGE_NAME),
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
});
