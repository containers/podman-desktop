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
import { beforeEach, expect, test, vi } from 'vitest';

import { kubernetesResourcesCount, kubernetesResourcesCountStore } from './kubernetes-resources-count';

beforeEach(() => {
  vi.resetAllMocks();
});

test('kubernetesResourcesCount in non experimental states mode', async () => {
  vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValue(false);

  const initialValues: ResourceCount[] = [
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

  // values are never fetched
  await new Promise(resolve => setTimeout(resolve, 500));
  const currentValue = get(kubernetesResourcesCount);
  expect(currentValue).toEqual([]);
  expect(vi.mocked(window.kubernetesGetResourcesCount)).not.toHaveBeenCalled();
});
