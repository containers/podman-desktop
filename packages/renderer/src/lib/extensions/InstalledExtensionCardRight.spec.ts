/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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
import { expect, test } from 'vitest';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import InstalledExtensionCardRight from './InstalledExtensionCardRight.svelte';

test('Expect to have description and version', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'dd',
    id: '',
    name: 'foo',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    devMode: false,
    bundled: false,
    version: 'v1.2.3',
    state: '',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardRight, { extension });

  // get region named Extension {extension.name} right actions
  const region = screen.getByRole('region', { name: 'Extension foo right actions' });
  expect(region).toBeInTheDocument();

  // region contains the description
  expect(region).toHaveTextContent('my description');

  // region contains the version
  const version = screen.getByLabelText('Version');
  expect(version).toBeInTheDocument();
  expect(version).toHaveTextContent('v1.2.3');

  // not removable
  expect(region).not.toHaveTextContent('Pre-installed');
});

test('Expect to have podman desktop extension info (removable = false)', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'dd',
    id: '',
    name: 'foo',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: false,
    devMode: false,
    bundled: false,
    version: 'v1.2.3',
    state: '',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardRight, { extension });

  // get region named Extension {extension.name} right actions
  const region = screen.getByRole('region', { name: 'Extension foo right actions' });
  expect(region).toBeInTheDocument();

  // region contains the details
  expect(region).toHaveTextContent('Pre-installed');
});

test('Expect the update button next to the version when an update is available', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'podman-desktop.quadlet',
    name: 'quadlet',
    description: 'my description',
    displayName: 'Podman Quadlet',
    publisher: 'podman-desktop',
    removable: true,
    devMode: false,
    bundled: false,
    version: '0.12.0',
    state: 'started',
    path: '/plugins/quadlet',
    readme: '',
    update: { version: '0.12.1', ociUri: 'ghcr.io/podman-desktop/pd-extension-quadlet:0.12.1' },
  };
  render(InstalledExtensionCardRight, { extension });

  const version = screen.getByLabelText('Version');
  expect(version).toContainElement(screen.getByRole('button', { name: 'Update available' }));
});
