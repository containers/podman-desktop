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

import type { ContextPermission } from '@desktop-framework/api';
import { get } from 'svelte/store';
import { assert, beforeEach, expect, test, vi } from 'vitest';

import { kubernetesContextsPermissions, kubernetesContextsPermissionsStore } from './kubernetes-context-permission';

const callbacks = new Map<string, (data?: unknown) => void | Promise<void>>();

beforeEach(() => {
  callbacks.clear();
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((message, callback) => {
    callbacks.set(message, callback);
    return { dispose: vi.fn() };
  });
});

test('kubernetesContextsPermissions in experimental states mode', async () => {
  vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValue(true);

  const initialValues: ContextPermission[] = [];
  const nextValues: ContextPermission[] = [
    {
      contextName: 'context1',
      resourceName: 'pods',
      permitted: true,
    },
    {
      contextName: 'context2',
      resourceName: 'deployments',
      permitted: false,
    },
  ];
  vi.mocked(window.kubernetesGetContextsPermissions).mockResolvedValue(initialValues);

  kubernetesContextsPermissionsStore.setup();

  // send 'extensions-already-started' event
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitFor(() => {
    const currentValue = get(kubernetesContextsPermissions);
    expect(currentValue).toEqual(initialValues);
  }, 500);

  // data has been updated in the backend
  vi.mocked(window.kubernetesGetContextsPermissions).mockResolvedValue(nextValues);

  // send an event indicating the data is updated
  const event = 'kubernetes-contexts-permissions';
  const callback = callbacks.get(event);
  assert(callback);
  await callback();

  await vi.waitFor(() => {
    // check received data is updated
    const currentValue = get(kubernetesContextsPermissions);
    expect(currentValue).toEqual(nextValues);
  }, 500);
});
