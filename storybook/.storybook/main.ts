/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type { StorybookConfig } from '@storybook/svelte-vite';
import { join, dirname } from 'node:path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.mdx', '../src/stories/**/*.stories.@(js|jsx|ts|tsx|svelte)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    // Do not use getAbsolutePath
    '@storybook/addon-svelte-csf',
    'storybook-dark-mode',
  ],
  typescript: {
    check: true,
  },
  framework: {
    name: getAbsolutePath('@storybook/svelte-vite'),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  // @ts-ignore
  css: {
    postcss: {
      plugins: {
        tailwindcss: { config: 'tailwind.config.js' },
        'postcss-import': {},
        autoprefixer: {},
      },
    },
  },
};

export default config;
