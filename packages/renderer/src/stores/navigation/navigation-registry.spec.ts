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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { get } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import { configurationProperties } from '../configurationProperties';
import { fetchNavigationRegistries, navigationRegistry } from './navigation-registry';

const kubernetesRegisterGetCurrentContextResourcesMock = vi.fn();
const kubernetesGetCurrentContextGeneralStateMock = vi.fn();

const getConfigurationValueMock = vi.fn();
beforeEach(() => {
  vi.resetAllMocks();
  (window as any).kubernetesRegisterGetCurrentContextResources = kubernetesRegisterGetCurrentContextResourcesMock;
  (window as any).window.kubernetesGetCurrentContextGeneralState = kubernetesGetCurrentContextGeneralStateMock;
  (window as any).getConfigurationValue = getConfigurationValueMock;
  (window as any).sendNavigationItems = vi.fn();
});

test('check navigation registry items', async () => {
  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([]);
  kubernetesGetCurrentContextGeneralStateMock.mockResolvedValue({});
  await fetchNavigationRegistries();
  const registries = get(navigationRegistry);
  // expect 7 items in the registry
  expect(registries.length).equal(7);
});

test('check update properties', async () => {
  // first, check that all items are visible
  const items = get(navigationRegistry);
  items.forEach(item => {
    expect(item.hidden).toBeFalsy();
  });

  // Say that Containers and Pods are hidden by the configuration
  getConfigurationValueMock.mockResolvedValue(['Containers', 'Pods']);

  // do an update to force the update
  configurationProperties.set([]);

  // wait that the update is done asynchronously
  await new Promise(resolve => setTimeout(resolve, 500));

  // and now check the hidden values
  const hidden = get(navigationRegistry);

  const allItemsExceptContainersAndPods = hidden.filter(item => item.name !== 'Containers' && item.name !== 'Pods');
  allItemsExceptContainersAndPods.forEach(item => {
    expect(item.hidden).toBeFalsy();
  });

  const containersAndPods = hidden.filter(item => item.name === 'Containers' || item.name === 'Pods');
  containersAndPods.forEach(item => {
    expect(item.hidden).toBeTruthy();
  });
});
