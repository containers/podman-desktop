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

import type { ResourceCount } from '@desktop-framework/api';
import { get } from 'svelte/store';
import { assert, beforeEach, expect, test, vi } from 'vitest';

import { kubernetesResourcesCount, kubernetesResourcesCountStore } from './kubernetes-resources-count';

const callbacks = new Map<string, (data?: unknown) => void | Promise<void>>();

beforeEach(() => {
  callbacks.clear();
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((message, callback) => {
    callbacks.set(message, callback);
    return { dispose: vi.fn() };
  });
});

test('kubernetesResourcesCount in experimental states mode', async () => {
  vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValue(true);

  const initialValues: ResourceCount[] = [];
  const nextValues: ResourceCount[] = [
    {
      contextName: 'context1',
      resourceName: 'pods',
      count: 1,
    },
    {
      contextName: 'context2',
      resourceName: 'deployments',
      count: 2,
    },
  ];
  vi.mocked(window.kubernetesGetResourcesCount).mockResolvedValue(initialValues);

  kubernetesResourcesCountStore.setup();

  // send 'extensions-already-started' event
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitFor(() => {
    const currentValue = get(kubernetesResourcesCount);
    expect(currentValue).toEqual(initialValues);
  }, 500);

  // data has been updated in the backend
  vi.mocked(window.kubernetesGetResourcesCount).mockResolvedValue(nextValues);

  // send an event indicating the data is updated
  const event = 'kubernetes-resources-count';
  const callback = callbacks.get(event);
  assert(callback);
  await callback();

  await vi.waitFor(() => {
    // check received data is updated
    const currentValue = get(kubernetesResourcesCount);
    expect(currentValue).toEqual(nextValues);
  }, 500);
});
