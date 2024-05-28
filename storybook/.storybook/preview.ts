import type { Preview } from '@storybook/svelte';
import 'tailwindcss/tailwind.css';
import { createElement } from 'react';
import { useDarkMode } from 'storybook-dark-mode';
import { themes } from '@storybook/theming';
import { DocsContainer } from '@storybook/addon-docs';
import './dark.css';
import './light.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      current: 'light',
      darkClass: 'dark-scheme',
      lightClass: 'light-scheme',
      dark: {
        ...themes.dark,
        appPreviewBg: 'transparent',
      },
      light: {
        ...themes.light,
        appPreviewBg: 'transparent',
      },
      stylePreview: true,
    },
    docs: {
      container: props => {
        const isDark = useDarkMode();
        const currentProps = { ...props };
        currentProps.theme = isDark ? themes.dark : themes.light;
        return createElement(DocsContainer, currentProps);
      },
    },
  },
};

export default preview;
