/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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
import { beforeEach, expect, test, vi } from 'vitest';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import ExtensionAutoUpdate from './ExtensionAutoUpdate.svelte';

/**
 * Build an extension installed by the user, the given fields taking precedence.
 */
function buildExtension(fields: Partial<CombinedExtensionInfoUI> = {}): CombinedExtensionInfoUI {
  return {
    id: 'foo.bar',
    name: 'bar',
    description: 'bar',
    displayName: 'Bar',
    publisher: 'foo',
    removable: true,
    devMode: false,
    bundled: false,
    version: '1.0.0',
    state: 'started',
    path: '/plugins/bar',
    readme: '',
    type: 'pd',
    ...fields,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.setExtensionAutoUpdate).mockResolvedValue(undefined);
});

test('an extension having its automatic updates disabled offers to enable them', async () => {
  render(ExtensionAutoUpdate, { extension: buildExtension({ autoUpdateDisabled: true }) });

  screen.getByText('Disabled');
  await fireEvent.click(screen.getByRole('button', { name: 'Enable' }));

  expect(window.setExtensionAutoUpdate).toHaveBeenCalledWith('foo.bar', true);
});

test('an extension having its automatic updates enabled offers to disable them', async () => {
  render(ExtensionAutoUpdate, { extension: buildExtension({ autoUpdateDisabled: false }) });

  screen.getByText('Enabled');
  await fireEvent.click(screen.getByRole('button', { name: 'Disable' }));

  expect(window.setExtensionAutoUpdate).toHaveBeenCalledWith('foo.bar', false);
});

test('a failure to change the automatic updates is logged', async () => {
  vi.spyOn(console, 'error');
  const error = new Error('failed');
  vi.mocked(window.setExtensionAutoUpdate).mockRejectedValue(error);
  render(ExtensionAutoUpdate, { extension: buildExtension() });

  await fireEvent.click(screen.getByRole('button', { name: 'Disable' }));

  await vi.waitFor(() =>
    expect(console.error).toHaveBeenCalledWith('Unable to change the automatic updates of extension foo.bar', error),
  );
});

test('the button is in progress while the automatic updates are being changed', async () => {
  const { promise, resolve } = Promise.withResolvers<void>();
  vi.mocked(window.setExtensionAutoUpdate).mockReturnValue(promise);
  render(ExtensionAutoUpdate, { extension: buildExtension() });

  const button = screen.getByRole('button', { name: 'Disable' });
  await fireEvent.click(button);
  await vi.waitFor(() => expect(button).toBeDisabled());

  resolve();
  await vi.waitFor(() => expect(button).toBeEnabled());
});

test('the automatic updates of a bundled extension can be disabled', () => {
  render(ExtensionAutoUpdate, { extension: buildExtension({ removable: false, bundled: true }) });

  screen.getByRole('button', { name: 'Disable' });
});

test.each([
  { name: 'a Docker Desktop extension', extension: buildExtension({ type: 'dd' }) },
  { name: 'an extension from a development folder', extension: buildExtension({ removable: false, devMode: true }) },
])('nothing is offered for $name, never updated automatically', ({ extension }) => {
  render(ExtensionAutoUpdate, { extension });

  expect(screen.queryByRole('region', { name: 'Auto-update' })).not.toBeInTheDocument();
});
