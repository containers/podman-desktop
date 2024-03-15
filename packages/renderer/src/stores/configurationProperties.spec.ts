/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import { beforeAll, expect, test, vi } from 'vitest';

import type { IConfigurationChangeEvent } from '../../../main/src/plugin/configuration-registry';
import { onDidChangeConfiguration, setupConfigurationChange } from './configurationProperties';

// first, patch window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

Object.defineProperty(global, 'window', {
  value: {
    events: {
      receive: eventEmitter.receive,
    },
    addEventListener: eventEmitter.receive,
  },
  writable: true,
});

beforeAll(() => {
  vi.clearAllMocks();
  setupConfigurationChange();
});

test('notified when there is a change', async () => {
  const received: IConfigurationChangeEvent[] = [];

  onDidChangeConfiguration.addEventListener('my.property', (event: any) => {
    received.push(event.detail);
  });

  // expect no events have been received
  expect(received.length).toBe(0);

  // now, send an event
  const onDidChangeCallback = callbacks.get('onDidChangeConfiguration');
  expect(onDidChangeCallback).toBeDefined();

  // call the callback with a new value
  onDidChangeCallback({
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
