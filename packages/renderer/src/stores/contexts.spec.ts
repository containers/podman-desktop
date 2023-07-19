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

import { get } from 'svelte/store';
import type { Mock } from 'vitest';
import { expect, test, vi } from 'vitest';
import { ContextUI } from '../lib/context/context';
import { contextsEventStore, contexts, fetchContexts } from './contexts';

// first, path window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

const listContextsMock: Mock<any, Promise<ContextUI[]>> = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    listContexts: listContextsMock,
    events: {
      receive: eventEmitter.receive,
    },
    addEventListener: eventEmitter.receive,
  },
  writable: true,
});

beforeAll(() => {
  vi.clearAllMocks();
});

test('contexts should be updated in case of an extension is stopped', async () => {
  // initial view
  listContextsMock.mockResolvedValue([new ContextUI(0, null, 'extension')]);
  contextsEventStore.setup();

  const callback = callbacks.get('extensions-already-started');
  // send 'extensions-already-started' event
  expect(callback).toBeDefined();
  await callback();

  // now ready to fetch volumes
  await fetchContexts();

  // now get list
  const ctxs = get(contexts);
  expect(ctxs.length).toBe(1);
  expect(ctxs[0].extension).toEqual('0');
  expect(ctxs[0].extension).toEqual('extension');

  // ok now mock the listVolumes function to return an empty list
  listContextsMock.mockResolvedValue([]);

  // call 'container-removed-event' event
  const extensionStoppedCallback = callbacks.get('extension-stopped');
  expect(extensionStoppedCallback).toBeDefined();
  await extensionStoppedCallback();

  // check if the volumes are updated
  const ctxs2 = get(contexts);
  expect(ctxs2.length).toBe(0);
});
