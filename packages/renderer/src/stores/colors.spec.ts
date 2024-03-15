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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { get } from 'svelte/store';
import type { Mock } from 'vitest';
import { beforeEach, expect, test, vi } from 'vitest';

import type { ColorInfo } from '../../../main/src/plugin/api/color-info';
import { colorsEventStore, colorsInfos } from './colors';

const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

vi.mock('../lib/appearance/appearance-util', () => {
  return {
    AppearanceUtil: class {
      getTheme = async () => 'light';
    },
  };
});

const listColorsMock: Mock<any, Promise<ColorInfo[]>> = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    listColors: listColorsMock,
    getConfigurationValue: vi.fn(),
    events: {
      receive: eventEmitter.receive,
    },
    addEventListener: eventEmitter.receive,
  },
  writable: true,
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('grab colors', async () => {
  // initial view
  listColorsMock.mockResolvedValue([
    {
      id: 'color1',
      value: '#123',
      cssVar: '--pd-color1',
    },
    { id: 'color2', value: '#456', cssVar: '--pd-color2' },
  ]);
  colorsEventStore.setup();

  const callback = callbacks.get('extensions-already-started');
  // send 'extensions-already-started' event
  expect(callback).toBeDefined();
  await callback();

  // wait listColors is called
  while (!listColorsMock.mock.calls.length) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // now get list
  const colors = get(colorsInfos);
  expect(colors.length).toBe(2);

  // check colors values
  expect(colors[0].id).toBe('color1');
  expect(colors[0].value).toBe('#123');
  expect(colors[0].cssVar).toBe('--pd-color1');
  expect(colors[1].id).toBe('color2');
  expect(colors[1].value).toBe('#456');
  expect(colors[1].cssVar).toBe('--pd-color2');
});
