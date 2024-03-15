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
import { beforeAll, expect, test, vi } from 'vitest';

import type { ViewInfoUI } from '../../../main/src/plugin/api/view-info';
import { fetchViews, viewsContributions, viewsEventStore } from './views';

// first, path window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

const listViewsMock: Mock<any, Promise<ViewInfoUI[]>> = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    listViewsContributions: listViewsMock,
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

test('views should be updated in case of an extension is stopped', async () => {
  // initial view
  listViewsMock.mockResolvedValue([
    {
      extensionId: 'extension',
      viewId: 'view',
      when: 'when',
      icon: 'icon',
    } as unknown as ViewInfoUI,
  ]);
  viewsEventStore.setup();

  const callback = callbacks.get('extensions-already-started');
  // send 'extensions-already-started' event
  expect(callback).toBeDefined();
  await callback();

  // now ready to fetch volumes
  await fetchViews();

  // now get list
  const views = get(viewsContributions);
  expect(views.length).toBe(1);
  expect(views[0].extensionId).toEqual('extension');

  // ok now mock the listVolumes function to return an empty list
  listViewsMock.mockResolvedValue([]);

  // call 'container-removed-event' event
  const extensionStoppedCallback = callbacks.get('extension-stopped');
  expect(extensionStoppedCallback).toBeDefined();
  await extensionStoppedCallback();

  // wait a little
  await new Promise(resolve => setTimeout(resolve, 100));

  // check if the volumes are updated
  const views2 = get(viewsContributions);
  expect(views2.length).toBe(0);
});
