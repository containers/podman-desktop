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

import type { Preview } from '@storybook/svelte';
import 'tailwindcss/tailwind.css';
import { createElement, useState, useEffect } from 'react';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { themes } from '@storybook/theming';
import { DocsContainer } from '@storybook/addon-docs';
import './themes.css';

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
      darkClass: 'dark',
      lightClass: 'light',
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
        const [isDark, setDark] = useState(true);

        useEffect(() => {
          props.context.channel.on(DARK_MODE_EVENT_NAME, setDark);

          return () => props.context.channel.removeListener(DARK_MODE_EVENT_NAME, setDark);
        }, [props.context.channel]);

        const currentProps = { ...props };
        currentProps.theme = isDark ? themes.dark : themes.light;
        return createElement(DocsContainer, currentProps);
      },
    },
  },
};

export default preview;
