/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import path from 'node:path';
/**
 * Config for global end-to-end tests
 * placed in project root tests folder
 * @type {import('vite').UserConfig}
 * @see https://vitest.dev/config/
 */
const config = {
  test: {
    globals: true,
    environment: 'jsdom',
    /**
     * By default, vitest search test files in all packages.
     * For e2e tests have sense search only is project root tests folder
     */
    include: ['**/{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/builtin/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp,cdix}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*',
    ],

    /**
     * A default timeout of 5000ms is sometimes not enough for playwright.
     */
    testTimeout: 30_000,
    hookTimeout: 30_000,
    /**
     * Vitest configuration for code coverage of the extensions folder
     */
    coverage: {
      all: true,
      src: ['extensions'],
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
      reportsDirectory: '../test-resources/coverage/extensions',
      reporter: ['lcov', 'json', 'text-summary'],
    },
  },
  resolve: {
    alias: {
      '@tmpwip/extension-api': path.resolve(__dirname, '__mocks__/@tmpwip/extension-api.js'),
    },
  },
};

export default config;
