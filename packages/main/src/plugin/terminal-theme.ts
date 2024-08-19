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

import type { ITheme } from '@xterm/xterm';

// Array of strings to extract from the CSS variables
// we list it here as we cannot infer the properties from the ITheme type at runtime. Another reason is to avoid
// the conflict with the 'extendedAnsi' string[] array key. We also provide "safer" method of gathering the CSS values.
const KNOWN_THEME_PROPERTIES = [
  'foreground',
  'background',
  'cursor',
  'selectionBackground',
  'selectionForeground',
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'brightBlack',
  'brightRed',
  'brightGreen',
  'brightYellow',
  'brightBlue',
  'brightMagenta',
  'brightCyan',
  'brightWhite',
] as const;

const TERMINAL_PREFIX = '--pd-terminal-';

// Utility function to get the terminal theme from CSS variables supplied by color-registry
// we do this by getting the computed style of the root element and extracting the values of the variables
// that start with the prefix '--pd-terminal-'
// we then go through all known theme properties of ITheme and assign the values to the theme object
export function getTerminalTheme(): ITheme | undefined {
  const root = document.documentElement;

  if (!root) {
    console.error(
      'Could not find document.documentElement and was unable to load terminal theme, returning undefined / default theme',
    );
    return undefined;
  }

  // Get the computed style of the root element containing the color-registry variables
  const computedStyle = window.getComputedStyle(root);
  const theme: ITheme = {} as ITheme;

  // Extract and assign each property to the theme object from the CSS variables
  KNOWN_THEME_PROPERTIES.forEach(property => {
    const cssVar = `${TERMINAL_PREFIX}${property}`;

    // Find the property value, trim it and assign it to the theme object
    // only if it is not an empty string
    const propertyValue = computedStyle.getPropertyValue(cssVar).trim();
    if (propertyValue) {
      theme[property] = propertyValue;
    }
  });

  return theme;
}
