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

const tailwindColors = require('tailwindcss/colors')

import colorPalette from './tailwind-color-palette.json';

module.exports = {
  content: [
    'packages/renderer/index.html',
    'packages/renderer/src/**/*.{svelte,ts,css}',
    'packages/ui/src/**/*.{svelte,ts,css}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        "titlebar": 'inset 0px -1px 0px 0 rgb(54 54 61 / 0.6)', // highlight for bottom of titlebar
	"pageheader": 'inset 0 0px 10px 0 rgb(0 0 0 / 0.4)',
	"nav": 'inset 7px -4px 6px 0 rgb(0 0 0 / 0.15)',
      },
      transitionProperty: {
        width: 'width',
      },
      width: {
        'leftnavbar': '48px',
        'leftsidebar': '225px',
      },
      minWidth: {
        'leftnavbar': '48px',
        'leftsidebar': '225px',
      },
    },
    colors: {
      // import colors from the color palette
      ...colorPalette,
      // The "status" colours to be used for Podman and Kubernetes containers
      // these can be referenced by in the form of "bg-status-running" or "text-status-running"
      'status': {
        // Podman & Kubernetes
        'running': tailwindColors.green[400],

        // Kubernetes only
        'terminated': tailwindColors.red[500],
        'waiting': tailwindColors.amber[600],

        // Podman only
        'starting': tailwindColors.green[600],

        // Stopped & Exited are the same color / same thing in the eyes of statuses
        'stopped': tailwindColors.gray[300],
        'exited': tailwindColors.gray[300],

        // "Warning"
        'paused': tailwindColors.amber[600],
        'degraded': tailwindColors.amber[700],

        // Others
        'created': tailwindColors.green[300],
        'dead': tailwindColors.red[500],

        // If we don't know the status, use gray
        'unknown': tailwindColors.gray[100],

      },
      // The remaining colors below are not part of our palette and are only here
      // to maintain existing code. No new use.
      'zinc': {
        100: tailwindColors.zinc[100],
        200: tailwindColors.zinc[200],
        300: tailwindColors.zinc[300],
        400: tailwindColors.zinc[400],
        600: tailwindColors.zinc[600],
        700: tailwindColors.zinc[700],
      },
      'violet': {
         50: tailwindColors.violet[50],
        400: tailwindColors.violet[400],
        500: tailwindColors.violet[500],
        600: tailwindColors.violet[600],
        700: tailwindColors.violet[700],
      },
    },
  },
  plugins: [],
};
