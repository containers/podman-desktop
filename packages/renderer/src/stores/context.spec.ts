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

import { get } from 'svelte/store';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { ContextUI } from '../lib/context/context';
import { setup } from './context';

const contextCollectAllValues = vi.fn();
const receiveMock = vi.fn();
const addEventListenerMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'contextCollectAllValues', { value: contextCollectAllValues });
  Object.defineProperty(window, 'events', { value: { receive: receiveMock } });
  Object.defineProperty(window, 'addEventListener', { value: addEventListenerMock });
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
});

test('context store values updated on context-value-updated/context-key-removed events', async () => {
  receiveMock.mockImplementation((msg: string, f: (value: unknown) => void) => {
    if (msg === 'context-value-updated') {
      setTimeout(() => f({ key: 'c', value: 'three' }), 5);
      setTimeout(() => f({ key: 'b', value: 2 }), 15);
    } else if (msg === 'context-key-removed') {
      setTimeout(() => f({ key: 'a', value: 1 }), 10);
    }
  });

  vi.useFakeTimers();
  const context = setup();
  const initial = new ContextUI();
  initial.setValue('a', 1);
  initial.setValue('b', 'two');
  context.set(initial);

  vi.advanceTimersByTime(6);
  initial.setValue('c', 'three');
  // context-value-updated has added the value to the store
  expect(get(context)).toEqual(initial);

  vi.advanceTimersByTime(5);
  initial.removeValue('a');
  // context-key-removed has removed the value from the store
  expect(get(context)).toEqual(initial);

  vi.advanceTimersByTime(5);
  initial.setValue('b', 2);
  // context-key-updated has updated the value in the store
  expect(get(context)).toEqual(initial);
});

test('context store values set on extensions-already-started', async () => {
  contextCollectAllValues.mockResolvedValue({ a: 1, b: 'two' });
  addEventListenerMock.mockImplementation((msg: string, f: () => void) => {
    if (msg === 'extensions-already-started') {
      f();
    }
  });

  const context = setup();

  const expected = new ContextUI();
  expected.setValue('a', 1);
  expected.setValue('b', 'two');

  await new Promise(resolve => setTimeout(resolve, 0));
  expect(get(context)).toEqual(expected);
});
