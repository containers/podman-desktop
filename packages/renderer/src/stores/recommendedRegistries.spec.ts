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

import type { RecommendedRegistry } from '@desktop-framework/api/recommendations';
import { get } from 'svelte/store';
import { assert, beforeEach, expect, test, vi } from 'vitest';

import {
  fetchRecommendedRegistries,
  recommendedRegistries,
  recommendedRegistriesEventStore,
} from './recommendedRegistries';

const callbacks = new Map<string, (data?: unknown) => void | Promise<void>>();

beforeEach(() => {
  callbacks.clear();
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((message, callback) => {
    callbacks.set(message, callback);
    return { dispose: vi.fn() };
  });
});

test('recommendedRegistries should be updated in case of an extension is stopped', async () => {
  vi.mocked(window.getRecommendedRegistries).mockResolvedValue([
    {
      extensionId: 'my.extensionId',
      name: 'Hello',
      id: 'my.registry.com',
      errors: ['foo'],
    } as unknown as RecommendedRegistry,
  ]);
  recommendedRegistriesEventStore.setup();

  // send 'extensions-already-started' event
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // now ready to fetch recommended registries
  await fetchRecommendedRegistries();

  // now get list
  const registries = get(recommendedRegistries);
  expect(registries.length).toBe(1);
  expect(registries[0].extensionId).toEqual('my.extensionId');

  // ok now mock the getRecommendedRegistries function to return an empty list
  vi.mocked(window.getRecommendedRegistries).mockResolvedValue([]);

  // call 'container-removed-event' event
  const extensionStoppedCallback = callbacks.get('extension-stopped');
  assert(extensionStoppedCallback);
  await extensionStoppedCallback();

  // wait a little
  await new Promise(resolve => setTimeout(resolve, 100));

  expect(vi.mocked(window.getRecommendedRegistries)).toHaveBeenCalled();

  // check if the registries are updated
  const registries2 = get(recommendedRegistries);
  expect(registries2.length).toBe(0);
});

test('recommendedRegistries should be updated in case configuration changed is called with expected key', async () => {
  vi.mocked(window.getRecommendedRegistries).mockResolvedValue([
    {
      extensionId: 'my.extensionId',
      name: 'Hello',
      id: 'my.registry.com',
      errors: ['foo'],
    } as unknown as RecommendedRegistry,
  ]);
  recommendedRegistriesEventStore.setup();

  // send 'extensions-already-started' event
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // now ready to fetch recommended registries
  await fetchRecommendedRegistries();

  // now get list
  const registries = get(recommendedRegistries);
  expect(registries.length).toBe(1);
  expect(registries[0].extensionId).toEqual('my.extensionId');

  // ok now mock the getRecommendedRegistries function to return an empty list
  vi.mocked(window.getRecommendedRegistries).mockResolvedValue([]);
  vi.mocked(window.getRecommendedRegistries).mockClear();
  // call 'container-removed-event' event
  const configurationChangedCallback = callbacks.get('configuration-changed');
  assert(configurationChangedCallback);
  await configurationChangedCallback({ key: 'extensions.ignoreRecommendations' });

  // wait a little
  await new Promise(resolve => setTimeout(resolve, 100));

  expect(vi.mocked(window.getRecommendedRegistries)).toHaveBeenCalled();
});

test('recommendedRegistries should not be updated in case configuration changed is called with unexpected key', async () => {
  vi.mocked(window.getRecommendedRegistries).mockResolvedValue([
    {
      extensionId: 'my.extensionId',
      name: 'Hello',
      id: 'my.registry.com',
      errors: ['foo'],
    } as unknown as RecommendedRegistry,
  ]);
  recommendedRegistriesEventStore.setup();

  // send 'extensions-already-started' event
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // now ready to fetch recommended registries
  await fetchRecommendedRegistries();

  // now get list
  const registries = get(recommendedRegistries);
  expect(registries.length).toBe(1);
  expect(registries[0].extensionId).toEqual('my.extensionId');

  // ok now mock the getRecommendedRegistries function to return an empty list
  vi.mocked(window.getRecommendedRegistries).mockResolvedValue([]);
  vi.mocked(window.getRecommendedRegistries).mockClear();
  // call 'container-removed-event' event
  const configurationChangedCallback = callbacks.get('configuration-changed');
  assert(configurationChangedCallback);
  await configurationChangedCallback({ key: 'extensions.otherKey' });

  // wait a little
  await new Promise(resolve => setTimeout(resolve, 100));

  expect(vi.mocked(window.getRecommendedRegistries)).not.toHaveBeenCalled();
});
