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
import { describe, expect, test, vi } from 'vitest';

import { getTerminalTheme } from './terminal-theme.js';

describe('getTerminalTheme', () => {
  test('should return an ITheme object with properties from CSS variables', () => {
    // We do not want to mock *all* of the document, so we will use stubGlobal to mock only the properties we need
    const mockDocumentElement = {} as HTMLElement;
    vi.stubGlobal('document', {
      documentElement: mockDocumentElement,
    });
    vi.stubGlobal('window', {
      getComputedStyle: () => mockComputedStyle as unknown as CSSStyleDeclaration,
    });

    // Mock returned values with fake ones
    const mockComputedStyle = {
      getPropertyValue: (property: string): string => {
        const cssVariables: { [key: string]: string } = {
          '--pd-terminal-foreground': '#ffffff',
          '--pd-terminal-background': '#000000',
          '--pd-terminal-cursor': '#00ff00',
          '--pd-terminal-selectionBackground': '#cccccc',
          '--pd-terminal-selectionForeground': '#333333',
          '--pd-terminal-black': '#000000',
          '--pd-terminal-red': '#ff0000',
          '--pd-terminal-green': '#00ff00',
          '--pd-terminal-yellow': '#ffff00',
          '--pd-terminal-blue': '#0000ff',
          '--pd-terminal-magenta': '#ff00ff',
          '--pd-terminal-cyan': '#00ffff',
          '--pd-terminal-white': '#ffffff',
          '--pd-terminal-brightBlack': '#555555',
          '--pd-terminal-brightRed': '#ff5555',
          '--pd-terminal-brightGreen': '#55ff55',
          '--pd-terminal-brightYellow': '#ffff55',
          '--pd-terminal-brightBlue': '#5555ff',
          '--pd-terminal-brightMagenta': '#ff55ff',
          '--pd-terminal-brightCyan': '#55ffff',
          '--pd-terminal-brightWhite': '#ffffff',
        };
        return cssVariables[property] ?? '';
      },
    };

    const theme = getTerminalTheme();

    // Expect the theme to return back correctly from the mocked CSS variables.
    const expectedTheme: ITheme = {
      foreground: '#ffffff',
      background: '#000000',
      cursor: '#00ff00',
      selectionBackground: '#cccccc',
      selectionForeground: '#333333',
      black: '#000000',
      red: '#ff0000',
      green: '#00ff00',
      yellow: '#ffff00',
      blue: '#0000ff',
      magenta: '#ff00ff',
      cyan: '#00ffff',
      white: '#ffffff',
      brightBlack: '#555555',
      brightRed: '#ff5555',
      brightGreen: '#55ff55',
      brightYellow: '#ffff55',
      brightBlue: '#5555ff',
      brightMagenta: '#ff55ff',
      brightCyan: '#55ffff',
      brightWhite: '#ffffff',
    };

    expect(theme).toEqual(expectedTheme);
  });
});
