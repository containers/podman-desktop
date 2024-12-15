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

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import InstalledExtensionCardLeftLifecycle from './InstalledExtensionCardLeftLifecycle.svelte';

beforeAll(() => {
  Object.defineProperty(window, 'ddExtensionDelete', { value: vi.fn() });
  Object.defineProperty(window, 'removeExtension', { value: vi.fn() });
});

test('Expect to see start and delete on stopped pd Extension', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: '',
    name: 'foo',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    version: 'v1.2.3',
    state: 'stopped',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycle, { extension });

  // get actions
  const actions = screen.getByRole('group', { name: 'Extension Actions' });
  expect(actions).toBeInTheDocument();

  // should have start button and delete button
  const start = screen.getByRole('button', { name: 'Start' });
  expect(start).toBeInTheDocument();

  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();
});

test('Expect to see stop on started pd Extension', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: '',
    name: 'foo',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    version: 'v1.2.3',
    state: 'started',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycle, { extension });

  // get actions
  const actions = screen.getByRole('group', { name: 'Extension Actions' });
  expect(actions).toBeInTheDocument();

  // should have stop button
  const stop = screen.getByRole('button', { name: 'Stop' });
  expect(stop).toBeInTheDocument();
});
