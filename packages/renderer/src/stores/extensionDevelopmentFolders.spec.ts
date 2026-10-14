/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { IDisposable } from '@desktop-framework/api';
import { get } from 'svelte/store';
import { assert, beforeEach, expect, test, vi } from 'vitest';

import {
  extensionDevelopmentFolders,
  extensionDevelopmentFoldersEventStore,
  fetchExtensionDevelopmentFolders,
} from './extensionDevelopmentFolders';

// first, path window object
const callbacks = new Map<string, () => void>();
const eventEmitter = (message: string, func: (...args: unknown[]) => void): IDisposable => {
  callbacks.set(message, func);
  return {} as IDisposable;
};

beforeEach(() => {
  callbacks.clear();
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((channel, args) => {
    return eventEmitter(channel, args);
  });

  vi.spyOn(window, 'addEventListener').mockImplementation((event, callback) => {
    callbacks.set(event, callback as () => void);
  });
});

test('should be updated in case of an extension is stopped', async () => {
  // initial view
  vi.mocked(window.listExtensionDevelopmentFolders).mockResolvedValue([
    {
      path: 'foo',
    },
  ]);
  extensionDevelopmentFoldersEventStore.setup();

  const callback = callbacks.get('extensions-already-started');
  // send 'extensions-already-started' event
  assert(callback);
  callback();

  // now ready to fetch extension folders
  await fetchExtensionDevelopmentFolders();

  // now get list
  const extensionDevelopmentFoldersList1 = get(extensionDevelopmentFolders);
  expect(extensionDevelopmentFoldersList1.length).toBe(1);
  expect(extensionDevelopmentFoldersList1[0].path).toEqual('foo');

  // ok now mock the listExtensionDevelopmentFolders function to return an empty list
  vi.mocked(window.listExtensionDevelopmentFolders).mockResolvedValue([]);

  // call 'extension-stopped' event
  const extensionStoppedCallback = callbacks.get('extension-stopped');
  assert(extensionStoppedCallback);

  extensionStoppedCallback();

  // check if the onboardings are updated
  await vi.waitFor(() => {
    const extensionDevelopmentFoldersList2 = get(extensionDevelopmentFolders);
    expect(extensionDevelopmentFoldersList2.length).toBe(0);
  });
});

test('should be updated in case of an extension is started', async () => {
  // initial view
  vi.mocked(window.listExtensionDevelopmentFolders).mockResolvedValue([
    {
      path: 'foo',
    },
  ]);
  extensionDevelopmentFoldersEventStore.setup();

  const callback = callbacks.get('extensions-already-started');
  // send 'extensions-already-started' event
  assert(callback);
  callback();

  // now ready to fetch extension folders
  await fetchExtensionDevelopmentFolders();

  // now get list
  const extensionDevelopmentFoldersList1 = get(extensionDevelopmentFolders);
  expect(extensionDevelopmentFoldersList1.length).toBe(1);
  expect(extensionDevelopmentFoldersList1[0].path).toEqual('foo');

  // ok now mock the listExtensionDevelopmentFolders function to return an empty list
  vi.mocked(window.listExtensionDevelopmentFolders).mockResolvedValue([]);

  // call 'extension-stopped' event
  const extensionStoppedCallback = callbacks.get('extension-started');
  assert(extensionStoppedCallback);
  extensionStoppedCallback();

  // check if the onboardings are updated
  await vi.waitFor(() => {
    const extensionDevelopmentFoldersList2 = get(extensionDevelopmentFolders);
    expect(extensionDevelopmentFoldersList2.length).toBe(0);
  });
});
