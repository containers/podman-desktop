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
import { beforeEach, afterAll, test, expect, vi } from 'vitest';
import minimist from 'minimist';
import { generateStylesheet, getOutput, getStylesheet } from './generate-stylesheet';
import { ColorRegistry } from '../packages/main/src/plugin/color-registry';
import fs from 'node:fs';

// save the original argv
const originalArgv = process.argv;
afterAll(() => {
  process.argv = originalArgv;
});

vi.mock('minimist', () => ({
  default: vi.fn(),
}));

vi.mock('node:fs', () => {
  return {
    default: {
      writeFileSync: vi.fn(),
    },
  };
});

vi.mock('../packages/main/src/plugin/color-registry', () => ({
  ColorRegistry: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

const colorRegistryMock = {
  listColors: vi.fn(),
  listThemes: vi.fn(),
} as unknown as ColorRegistry;

test('getOutput', () => {
  // mocks the arguments
  process.argv = ['--output', 'hello-world'];

  vi.mocked(minimist).mockReturnValue({
    output: 'hello-world',
  });

  const output = getOutput();
  expect(output).toBe('hello-world');
});

test('getStylesheet', () => {
  vi.mocked(colorRegistryMock.listColors).mockReturnValue([
    {
      cssVar: 'css-var',
      value: '#fff',
      id: 'dummy-id',
    },
  ]);
  const style = getStylesheet(colorRegistryMock, 'dummy-theme');

  expect(colorRegistryMock.listColors).toHaveBeenCalledWith('dummy-theme');
  expect(style).toContain('css-var: #fff;');
});

test('generateStylesheet', () => {
  vi.mocked(colorRegistryMock.listColors).mockReturnValue([]);
  vi.mocked(colorRegistryMock.listThemes).mockReturnValue(['red', 'purple']);

  generateStylesheet(colorRegistryMock, 'dummy-file');

  expect(fs.writeFileSync).toHaveBeenCalledWith('dummy-file', expect.anything());
});
