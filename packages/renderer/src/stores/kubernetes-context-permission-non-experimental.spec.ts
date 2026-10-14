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
import { beforeEach, expect, test, vi } from 'vitest';

import { kubernetesContextsPermissions, kubernetesContextsPermissionsStore } from './kubernetes-context-permission';

beforeEach(() => {
  vi.resetAllMocks();
});

test('kubernetesContextsPermissions in experimental states mode', async () => {
  vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValue(false);

  const initialValues: ContextPermission[] = [
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

  // values are never fetched
  await new Promise(resolve => setTimeout(resolve, 500));
  const currentValue = get(kubernetesContextsPermissions);
  expect(currentValue).toEqual([]);
  expect(vi.mocked(window.kubernetesGetContextsPermissions)).not.toHaveBeenCalled();
});
