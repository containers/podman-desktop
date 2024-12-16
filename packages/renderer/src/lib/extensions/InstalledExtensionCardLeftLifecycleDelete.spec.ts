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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import InstalledExtensionCardLeftLifecycleDelete from './InstalledExtensionCardLeftLifecycleDelete.svelte';

beforeAll(() => {
  Object.defineProperty(window, 'ddExtensionDelete', { value: vi.fn() });
  Object.defineProperty(window, 'removeExtension', { value: vi.fn() });
});

afterEach(() => {
  vi.clearAllMocks();
});

test('Expect to delete dd Extension', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'dd',
    id: 'my.ExtensionId',
    name: 'foo',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    version: 'v1.2.3',
    state: '',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycleDelete, { extension });

  // get button with label 'Delete Extension foo'
  const button = screen.getByRole('button', { name: 'Delete' });
  expect(button).toBeInTheDocument();

  // click the button
  await fireEvent.click(button);

  // expect the delete function to be called
  expect(vi.mocked(window.ddExtensionDelete)).toHaveBeenCalledWith('my.ExtensionId');
  expect(vi.mocked(window.removeExtension)).not.toHaveBeenCalled();
});

test('Expect to delete pd Extension', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'idExtension',
    name: 'fooName',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    version: 'v1.2.3',
    state: '',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycleDelete, { extension });

  // get button with label 'Delete Extension foo'
  const button = screen.getByRole('button', { name: 'Delete' });
  expect(button).toBeInTheDocument();

  // click the button
  await fireEvent.click(button);

  // expect the delete function to be called
  expect(vi.mocked(window.ddExtensionDelete)).not.toHaveBeenCalled();
  expect(vi.mocked(window.removeExtension)).toHaveBeenCalledWith('idExtension');
});

test('Expect unable to delete pd Extension if not removable', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'idExtension',
    name: 'fooName',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: false,
    version: 'v1.2.3',
    state: 'stopped',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycleDelete, { extension });

  // get button with label 'Delete Extension foo'
  const button = screen.getByRole('button', { name: 'Delete' });
  expect(button).toBeInTheDocument();

  // expect to be disabled
  expect(button).toBeDisabled();
});

test('Expect able to delete pd Extension if removable', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'idExtension',
    name: 'fooName',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    version: 'v1.2.3',
    state: 'stopped',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycleDelete, { extension });

  // get button with label 'Delete Extension foo'
  const button = screen.getByRole('button', { name: 'Delete' });
  expect(button).toBeInTheDocument();

  // expect to be enabled
  expect(button).toBeEnabled();
});
