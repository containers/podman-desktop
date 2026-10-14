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

import type { ViewInfoUI } from '@desktop-framework/api';
import { get } from 'svelte/store';
import { assert, beforeEach, expect, test, vi } from 'vitest';

import { fetchViews, viewsContributions, viewsEventStore } from './views';

const callbacks = new Map<string, (data?: unknown) => void | Promise<void>>();

beforeEach(() => {
  callbacks.clear();
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((message, callback) => {
    callbacks.set(message, callback);
    return { dispose: vi.fn() };
  });
});

test('views should be updated in case of an extension is stopped', async () => {
  // initial view
  vi.mocked(window.listViewsContributions).mockResolvedValue([
    {
      extensionId: 'extension',
      viewId: 'view',
      when: 'when',
      icon: 'icon',
    } as unknown as ViewInfoUI,
  ]);
  viewsEventStore.setup();

  // send 'extensions-already-started' event
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // now ready to fetch volumes
  await fetchViews();

  // now get list
  const views = get(viewsContributions);
  expect(views.length).toBe(1);
  expect(views[0].extensionId).toEqual('extension');

  // ok now mock the listVolumes function to return an empty list
  vi.mocked(window.listViewsContributions).mockResolvedValue([]);

  // call 'container-removed-event' event
  const extensionStoppedCallback = callbacks.get('extension-stopped');
  assert(extensionStoppedCallback);
  await extensionStoppedCallback();

  // wait a little
  await new Promise(resolve => setTimeout(resolve, 100));

  // check if the volumes are updated
  const views2 = get(viewsContributions);
  expect(views2.length).toBe(0);
});
