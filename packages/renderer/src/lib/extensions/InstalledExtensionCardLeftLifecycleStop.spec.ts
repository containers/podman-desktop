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
import { beforeAll, expect, test, vi } from 'vitest';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import InstalledExtensionCardLeftLifecycleStop from './InstalledExtensionCardLeftLifecycleStop.svelte';

beforeAll(() => {
  Object.defineProperty(window, 'stopExtension', { value: vi.fn() });
});

test('Expect unable to stop dd Extension if started', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'dd',
    id: 'idExtension',
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
  render(InstalledExtensionCardLeftLifecycleStop, { extension });

  // get button with label 'Stop'
  const button = screen.queryByRole('button', { name: 'Stop' });
  expect(button).toBeInTheDocument();
  expect(button).toBeDisabled();
});

test('Expect to stop pd Extension if started', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'idExtension',
    name: 'fooName',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    version: 'v1.2.3',
    state: 'started',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycleStop, { extension });

  // get button with label 'Stop'
  const button = screen.getByRole('button', { name: 'Stop' });
  expect(button).toBeInTheDocument();

  // click the button
  await fireEvent.click(button);

  // expect the delete function to be called
  expect(vi.mocked(window.stopExtension)).toHaveBeenCalledWith('idExtension');
});

test('Expect unable to stop if already stopped', async () => {
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
  render(InstalledExtensionCardLeftLifecycleStop, { extension });

  // get button with label 'Stop'
  const button = screen.queryByRole('button', { name: 'Stop' });
  expect(button).not.toBeInTheDocument();
});

test('Expect to stop pd Extension if starting', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'idExtension',
    name: 'fooName',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    version: 'v1.2.3',
    state: 'starting',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycleStop, { extension });

  // get button with label 'Stop'
  const button = screen.getByRole('button', { name: 'Stop' });
  expect(button).toBeInTheDocument();

  // click the button
  await fireEvent.click(button);

  // expect the delete function to be called
  expect(vi.mocked(window.stopExtension)).toHaveBeenCalledWith('idExtension');
});
