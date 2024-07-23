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

import { expect, test } from 'vitest';

import { defaultTheme, getTerminalTheme, themes } from './terminal-theme.js';

test('should return the correct theme by name', () => {
  const darkTheme = getTerminalTheme('Dark');
  expect(darkTheme).toEqual(themes['Dark']);

  const lightTheme = getTerminalTheme('Light');
  expect(lightTheme).toEqual(themes['Light']);

  const solarizedDarkTheme = getTerminalTheme('Solarized Dark');
  expect(solarizedDarkTheme).toEqual(themes['Solarized Dark']);

  const solarizedLightTheme = getTerminalTheme('Solarized Light');
  expect(solarizedLightTheme).toEqual(themes['Solarized Light']);

  const zenburnTheme = getTerminalTheme('Zenburn');
  expect(zenburnTheme).toEqual(themes['Zenburn']);
});

test('should return the default theme if theme name is undefined', () => {
  const theme = getTerminalTheme(undefined);
  expect(theme).toEqual(defaultTheme);
});

test('should return the default theme if theme name does not exist', () => {
  const theme = getTerminalTheme('NonExistentTheme');
  expect(theme).toEqual(defaultTheme);
});

test('themes should all have correct properties', () => {
  Object.values(themes).forEach(theme => {
    expect(theme).toHaveProperty('foreground');
    expect(theme).toHaveProperty('background');
    expect(theme).toHaveProperty('cursor');
    expect(theme).toHaveProperty('black');
    expect(theme).toHaveProperty('brightBlack');
    expect(theme).toHaveProperty('red');
    expect(theme).toHaveProperty('brightRed');
    expect(theme).toHaveProperty('green');
    expect(theme).toHaveProperty('brightGreen');
    expect(theme).toHaveProperty('yellow');
    expect(theme).toHaveProperty('brightYellow');
    expect(theme).toHaveProperty('blue');
    expect(theme).toHaveProperty('brightBlue');
    expect(theme).toHaveProperty('magenta');
    expect(theme).toHaveProperty('brightMagenta');
    expect(theme).toHaveProperty('cyan');
    expect(theme).toHaveProperty('brightCyan');
    expect(theme).toHaveProperty('white');
    expect(theme).toHaveProperty('brightWhite');
  });
});
