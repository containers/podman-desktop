/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

const tailwindColors = require('tailwindcss/colors');
const colorPalette = require('./tailwind-color-palette.json');

module.exports = {
  content: [
    'packages/renderer/index.html',
    'packages/renderer/src/**/*.{svelte,ts,css}',
    'packages/ui/src/**/*.{svelte,ts,css}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      transitionProperty: {
        width: 'width',
      },
      width: {
        leftnavbar: '48px',
        leftsidebar: '170px',
      },
      minWidth: {
        leftnavbar: '48px',
        leftsidebar: '170px',
      },
    },
    fontSize: {
      xs: '10px',
      sm: '11px',
      base: '12px',
      lg: '14px',
      xl: '16px',
      '2xl': '18px',
      '3xl': '20px',
      '4xl': '24px',
      '5xl': '30px',
      '6xl': '36px',
    },
    colors: {
      // import colors from the color palette
      ...colorPalette,

      // The remaining colors below are not part of our palette and are only here
      // to maintain existing code. No new use.
      zinc: {
        100: tailwindColors.zinc[100],
        200: tailwindColors.zinc[200],
        300: tailwindColors.zinc[300],
        700: tailwindColors.zinc[700],
      },
      violet: {
        600: tailwindColors.violet[600],
        700: tailwindColors.violet[700],
      },
    },
  },
  plugins: [],
};
