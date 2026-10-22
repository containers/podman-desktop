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

import ExtensionUpdateLink from './ExtensionUpdateLink.svelte';

/**
 * Build an extension installed by the user, the given fields taking precedence.
 */
function buildExtension(fields: Partial<CombinedExtensionInfoUI> = {}): CombinedExtensionInfoUI {
  return {
    id: 'podman-desktop.quadlet',
    name: 'quadlet',
    description: 'quadlet',
    displayName: 'Podman Quadlet',
    publisher: 'podman-desktop',
    removable: true,
    devMode: false,
    bundled: false,
    version: '0.12.0',
    state: 'started',
    path: '/plugins/quadlet',
    readme: '',
    type: 'pd',
    ...fields,
  };
}

const update = { version: '0.12.1', ociUri: 'ghcr.io/podman-desktop/pd-extension-quadlet:0.12.1' };

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.updateExtension).mockResolvedValue(undefined);
});

test('nothing is displayed for an extension without update', () => {
  render(ExtensionUpdateLink, { extension: buildExtension() });

  expect(screen.queryByRole('button', { name: 'Update available' })).not.toBeInTheDocument();
});

test('clicking the link updates the extension', async () => {
  render(ExtensionUpdateLink, { extension: buildExtension({ update }) });

  const link = screen.getByRole('button', { name: 'Update available' });
  expect(link).toHaveAttribute('title', 'Podman Quadlet will be updated to v0.12.1');
  await fireEvent.click(link);

  expect(window.updateExtension).toHaveBeenCalledWith(
    'podman-desktop.quadlet',
    'ghcr.io/podman-desktop/pd-extension-quadlet:0.12.1',
  );
});

test('the link is in progress while the extension is being updated', async () => {
  const { promise, resolve } = Promise.withResolvers<void>();
  vi.mocked(window.updateExtension).mockReturnValue(promise);
  render(ExtensionUpdateLink, { extension: buildExtension({ update }) });

  const link = screen.getByRole('button', { name: 'Update available' });
  await fireEvent.click(link);
  await vi.waitFor(() => expect(link).toBeDisabled());

  resolve();
  await vi.waitFor(() => expect(link).toBeEnabled());
});

test('a failure to update the extension is logged', async () => {
  vi.spyOn(console, 'error');
  const error = new Error('failed');
  vi.mocked(window.updateExtension).mockRejectedValue(error);
  render(ExtensionUpdateLink, { extension: buildExtension({ update }) });

  await fireEvent.click(screen.getByRole('button', { name: 'Update available' }));

  await vi.waitFor(() =>
    expect(console.error).toHaveBeenCalledWith('Unable to update extension podman-desktop.quadlet', error),
  );
});
