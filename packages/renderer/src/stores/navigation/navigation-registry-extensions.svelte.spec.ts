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

import type { ContributionInfo, WebviewInfo } from '@desktop-framework/api';
import { beforeEach, expect, test, vi } from 'vitest';

import { contributions } from '/@/stores/contribs';
import { webviews } from '/@/stores/webviews';

import { createNavigationExtensionEntry, createNavigationExtensionGroup } from './navigation-registry-extension.svelte';

beforeEach(() => {
  vi.resetAllMocks();
});

test('createNavigationExtensionEntry', async () => {
  const entry = createNavigationExtensionEntry();

  expect(entry).toBeDefined();
  expect(entry.name).toBe('Extensions');
  expect(entry.link).toBe('/extensions');
  expect(entry.tooltip).toBe('Extensions');
  expect(entry.counter).toBe(0);
});

test('createNavigationExtensionGroup uses extensions prefix for all destinations', async () => {
  const group = createNavigationExtensionGroup();

  contributions.set([
    {
      name: 'Compose',
      icon: './compose.svg',
    } as ContributionInfo,
  ]);

  webviews.set([
    {
      id: 'dashboard',
      name: 'Dashboard',
      extensionId: 'compose',
      icon: './dashboard.svg',
    } as unknown as WebviewInfo,
  ]);

  await vi.waitFor(() => {
    expect(group.destinations).toHaveLength(2);
  });

  expect(group.destinations[0]?.name).toBe('Extensions: Dashboard');
  expect(group.destinations[1]?.name).toBe('Extensions: Compose');
});
