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

import path from 'node:path';

const PACKAGE_ROOT = __dirname;

export function coverageConfig(packageRoot, packageName) {
  const obj = { coverage: {
      all: true,
      clean: true,
      src: [packageRoot],
      exclude: [
        '**/builtin/**',
        '**/cypress/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '**/*.{tsx,cjs,js,d.ts}',
        '**/*-info.ts',
        '**/.{cache,git,idea,output,temp,cdix}/**',
        '**/*{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tailwind,postcss}.config.*',
      ],
      provider: 'c8',
      reportsDirectory: path.join(packageRoot, '../../', `test-resources/coverage/${packageName}`),
      reporter: ['lcov', 'text'],
    },
  };
  return obj;
}

const config = {
  test: {
      ...coverageConfig(PACKAGE_ROOT, 'extensions/kind'),
  },
  resolve: {
    alias: {
      '@podman-desktop/api': path.resolve('../../', '__mocks__/@podman-desktop/api.js'),
    },
  },
};

export default config;
