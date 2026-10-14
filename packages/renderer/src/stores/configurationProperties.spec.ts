/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import type { IConfigurationChangeEvent } from '@desktop-framework/api/configuration';
import { assert, beforeEach, expect, test, vi } from 'vitest';

import { onDidChangeConfiguration, setupConfigurationChange } from './configurationProperties';

const callbacks = new Map<string, (data?: unknown) => void | Promise<void>>();

beforeEach(() => {
  callbacks.clear();
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((message, callback) => {
    callbacks.set(message, callback);
    return { dispose: vi.fn() };
  });
  setupConfigurationChange();
});

test('notified when there is a change', async () => {
  const received: IConfigurationChangeEvent[] = [];

  onDidChangeConfiguration.addEventListener('my.property', event => {
    received.push((event as CustomEvent<IConfigurationChangeEvent>).detail);
  });

  // expect no events have been received
  expect(received.length).toBe(0);

  // now, send an event
  const onDidChangeCallback = callbacks.get('onDidChangeConfiguration');
  assert(onDidChangeCallback);

  // call the callback with a new value
  await onDidChangeCallback({
    key: 'my.property',
    value: 'new value',
    scope: 'DEFAULT',
  });

  // check that we received the event
  expect(received.length).toBe(1);
  expect(received[0].key).toBe('my.property');
  expect(received[0].value).toBe('new value');
  expect(received[0].scope).toBe('DEFAULT');
});
