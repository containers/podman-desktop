import type { StorybookConfig } from '@storybook/svelte-vite';
import { join, dirname } from 'path';

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
