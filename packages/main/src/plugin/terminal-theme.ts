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
import type { ITheme } from 'xterm';

/**
 * Below are a list of themes that can be used in the terminal, it is either dark or light.
 * Light themes will have a darker cursor colour as well as a darker selectionForeground colour to improve visibility
 */

// Common 'visibility' elements for light theme requirements
const LightThemeVisibilityChanges = {
  cursor: '#000000',
  selectionBackground: '#f0f0f0',
  selectionForeground: '#000000',
};

// "DefaultDark" theme with standard high-contrast colours
// default colours are from xterm.js
const DefaultDark: ITheme = {
  foreground: '#ffffff',
  background: '#000000',
  cursor: '#ffffff',

  black: '#000000',
  brightBlack: '#666666',

  red: '#990000',
  brightRed: '#e50000',

  green: '#00a600',
  brightGreen: '#00d900',

  yellow: '#999900',
  brightYellow: '#e5e500',

  blue: '#0000b2',
  brightBlue: '#0000ff',

  magenta: '#b200b2',
  brightMagenta: '#e500e5',

  cyan: '#00a6b2',
  brightCyan: '#00e5e5',

  white: '#bfbfbf',
  brightWhite: '#e5e5e5',
};

// Same as DefaultDark, but with different background, foreground and cursor colors
const DefaultLight: ITheme = {
  ...DefaultDark,
  ...LightThemeVisibilityChanges,
  foreground: '#000000',
  background: '#ffffff',
};

export const themes: { [key: string]: ITheme } = {
  dark: DefaultDark,
  light: DefaultLight,
};

// Default to dark theme
export const defaultTheme = DefaultDark;

// Get the theme, but default to default theme if not found
export function getTerminalTheme(themeName: string | undefined): ITheme {
  // If undefined or not found somehow, instead of being unable to display it, return the default theme
  return themes[themeName ?? 'dark'] ?? defaultTheme;
}
