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
import { beforeEach, expect, test, vi } from 'vitest';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import InstalledExtensionCardLeftLifecycle from './InstalledExtensionCardLeftLifecycle.svelte';

beforeEach(() => {
  (window as any).ddExtensionDelete = vi.fn();
  (window as any).removeExtension = vi.fn();
});

test('Expect to see start and delete on stopped pd extension', async () => {
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
  expect(start).toBeEnabled();

  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();
  expect(deleteButton).toBeEnabled();

  // should not have stop button
  const stop = screen.queryByRole('button', { name: 'Stop' });
  expect(stop).not.toBeInTheDocument();
});

test('Expect to see disabled start and delete on starting pd extension', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: '',
    name: 'foo',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    version: 'v1.2.3',
    state: 'starting',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycle, { extension });

  // should not have stop button
  const stop = screen.queryByRole('button', { name: 'Stop' });
  expect(stop).not.toBeInTheDocument();

  // should have disabled start button
  const start = screen.getByRole('button', { name: 'Start' });
  expect(start).toBeInTheDocument();
  expect(start).toBeDisabled();

  // should have disabled delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();
  expect(deleteButton).toBeDisabled();
});

test('Expect to see stop and disabled delete on started pd extension', async () => {
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
  expect(stop).toBeEnabled();

  // should not have start button
  const start = screen.queryByRole('button', { name: 'Start' });
  expect(start).not.toBeInTheDocument();

  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();
  expect(deleteButton).not.toBeEnabled();
});

test('Expect to see disabled start and delete on stopping pd extension', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: '',
    name: 'foo',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    version: 'v1.2.3',
    state: 'stopping',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycle, { extension });

  // should not have stop button
  const stop = screen.queryByRole('button', { name: 'Stop' });
  expect(stop).not.toBeInTheDocument();

  // should have disabled start button
  const start = screen.getByRole('button', { name: 'Start' });
  expect(start).toBeInTheDocument();
  expect(start).toBeDisabled();

  // should have disabled delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();
  expect(deleteButton).toBeDisabled();
});

test('Expect to see disabled start and enabled delete on unknown state pd extension', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: '',
    name: 'foo',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    version: 'v1.2.3',
    state: 'unknown',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycle, { extension });

  // should not have stop button
  const stop = screen.queryByRole('button', { name: 'Stop' });
  expect(stop).not.toBeInTheDocument();

  // should have disabled start button
  const start = screen.getByRole('button', { name: 'Start' });
  expect(start).toBeInTheDocument();
  expect(start).toBeDisabled();

  // should have delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();
  expect(deleteButton).toBeEnabled();
});
