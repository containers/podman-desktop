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

import { currentPage, history, lastPage, lastSubmenuPages } from './breadcrumb';

export function mockBreadcrumb() {
  history.set([{ name: 'List', path: '/list' } as TinroBreadcrumb]);
  lastPage.set({ name: 'Previous', path: '/last' } as TinroBreadcrumb);
  currentPage.set({ name: 'Current', path: '/current' } as TinroBreadcrumb);
  lastSubmenuPages.set({ 'page 1': '/page1', 'page 2': '/page2' });
}

test('Confirm mock values', async () => {
  mockBreadcrumb();

  const cur = get(currentPage);
  expect(cur.name).toBe('Current');

  const last = get(lastPage);
  expect(last.name).toBe('Previous');

  const hist = get(history);
  expect(hist[0].name).toBe('List');

  const submenuPages = get(lastSubmenuPages);
  expect(submenuPages['page 1']).toBe('/page1');
  expect(submenuPages['page 2']).toBe('/page2');
});
