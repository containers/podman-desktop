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
 * Below is a curated list of terminal themes that are available for selection / use within Podman Desktop.
 * The 'colors' are sourced from multiple repos and cross-checked for accuracy.
 * Each theme will have references to the original repo.
 *
 * Notes:
 * - Light themes will have a darker cursor colour as well as a darker selectionForeground colour to improve visibility
 */

// Common 'visibility' elements for light theme requirements
const LightThemeVisibilityChanges = {
  cursor: '#000000',
  selectionBackground: '#f0f0f0',
  selectionForeground: '#000000',
};

// From: https://github.com/ysk2014/xterm-theme/blob/master/src/iterm/Solarized_Dark.js
const SolarizedDark: ITheme = {
  foreground: '#708284',
  background: '#001e27',
  cursor: '#708284',

  black: '#002831',
  brightBlack: '#001e27',

  red: '#d11c24',
  brightRed: '#bd3613',

  green: '#738a05',
  brightGreen: '#475b62',

  yellow: '#a57706',
  brightYellow: '#536870',

  blue: '#2176c7',
  brightBlue: '#708284',

  magenta: '#c61c6f',
  brightMagenta: '#5956ba',

  cyan: '#259286',
  brightCyan: '#819090',

  white: '#eae3cb',
  brightWhite: '#fcf4dc',
};

// Same as above, but with different background, foreground and cursor colors
const SolarizedLight: ITheme = {
  ...SolarizedDark,
  ...LightThemeVisibilityChanges,
  foreground: '#536870',
  background: '#fcf4dc',
};

// From https://github.com/ysk2014/xterm-theme/blob/master/src/iterm/Zenburn.js
const Zenburn: ITheme = {
  foreground: '#dcdccc',
  background: '#3f3f3f',
  cursor: '#73635a',

  black: '#4d4d4d',
  brightBlack: '#709080',

  red: '#705050',
  brightRed: '#dca3a3',

  green: '#60b48a',
  brightGreen: '#c3bf9f',

  yellow: '#f0dfaf',
  brightYellow: '#e0cf9f',

  blue: '#506070',
  brightBlue: '#94bff3',

  magenta: '#dc8cc3',
  brightMagenta: '#ec93d3',

  cyan: '#8cd0d3',
  brightCyan: '#93e0e3',

  white: '#dcdccc',
  brightWhite: '#ffffff',
};

// Cross-referenced between three different theme sources:
// https://marketplace.visualstudio.com/items?itemName=SuperPaintman.monokai-extended
// https://github.com/phanviet/vim-monokai-pro
// https://monokai.pro/
// to determine the best colours. Then tested in xterm.js / Podman Desktop for visibility.
// Monokai theme
const MonokaiDark: ITheme = {
  foreground: '#f8f8f2',
  background: '#272822',
  cursor: '#f8f8f0',

  black: '#272822',
  brightBlack: '#75715e',

  red: '#f92672',
  brightRed: '#ff669d',

  green: '#a6e22e',
  brightGreen: '#b6e354',

  yellow: '#f4bf75',
  brightYellow: '#f5d897',

  blue: '#66d9ef',
  brightBlue: '#a1efe4',

  magenta: '#ae81ff',
  brightMagenta: '#fd5ff0',

  cyan: '#a1efe4',
  brightCyan: '#a1efe4',

  white: '#f8f8f2',
  brightWhite: '#ffffff',
};

// Monokai Light theme
const MonokaiLight: ITheme = {
  ...MonokaiDark,
  ...LightThemeVisibilityChanges,
  foreground: '#49483e',
  background: '#f9f8f5',
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
  Dark: DefaultDark,
  Light: DefaultLight,
  'Monokai Dark': MonokaiDark,
  'Monokai Light': MonokaiLight,
  'Solarized Dark': SolarizedDark,
  'Solarized Light': SolarizedLight,
  Zenburn: Zenburn,
};

// Default to dark theme
export const defaultTheme = DefaultDark;

// Get the theme, but default to default theme if not found
export function getTerminalTheme(themeName: string | undefined): ITheme {
  // If undefined or not found somehow, instead of being unable to display it, return the default theme
  return themes[themeName ?? 'Default Dark'] ?? defaultTheme;
}
