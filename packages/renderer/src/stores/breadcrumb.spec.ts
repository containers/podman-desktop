/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { get } from 'svelte/store';
import type { TinroBreadcrumb } from 'tinro';
import { expect, test } from 'vitest';

import { currentPage, history, lastKubernetesPage, lastPage, lastPreferencesPage } from './breadcrumb';

export function mockBreadcrumb() {
  history.set([{ name: 'List', path: '/list' } as TinroBreadcrumb]);
  lastPage.set({ name: 'Previous', path: '/last' } as TinroBreadcrumb);
  currentPage.set({ name: 'Current', path: '/current' } as TinroBreadcrumb);
}

test('Confirm mock values', async () => {
  mockBreadcrumb();

  const cur = get(currentPage);
  expect(cur.name).toBe('Current');

  const last = get(lastPage);
  expect(last.name).toBe('Previous');

  const hist = get(history);
  expect(hist[0].name).toBe('List');

  expect(get(lastKubernetesPage).path).toBe('/kubernetes/nodes');

  expect(get(lastPreferencesPage).path).toBe('/preferences');
});
