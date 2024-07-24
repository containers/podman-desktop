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

import { fetchNavigationRegistries, navigationRegistry } from './navigation-registry';

const kubernetesRegisterGetCurrentContextResourcesMock = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  (window as any).kubernetesRegisterGetCurrentContextResources = kubernetesRegisterGetCurrentContextResourcesMock;
});

test('check navigation registry items', async () => {
  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([]);
  await fetchNavigationRegistries();
  const registries = get(navigationRegistry);
  // expect 7 items in the registry
  expect(registries.length).equal(7);
});
