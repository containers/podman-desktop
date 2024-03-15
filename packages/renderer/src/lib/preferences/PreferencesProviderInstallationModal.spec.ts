/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import PreferencesProviderInstallationModal from './PreferencesProviderInstallationModal.svelte';

const providerInfo: ProviderInfo = {
  id: 'podman',
  name: 'podman',
  images: {
    icon: 'img',
  },
  status: 'started',
  warnings: [],
  containerProviderConnectionCreation: true,
  detectionChecks: [],
  containerConnections: [
    {
      name: 'machine',
      status: 'started',
      endpoint: {
        socketPath: 'socket',
      },
      lifecycleMethods: ['start', 'stop', 'delete'],
      type: 'podman',
    },
  ],
  installationSupport: false,
  internalId: '0',
  kubernetesConnections: [],
  kubernetesProviderConnectionCreation: true,
  links: [],
  containerProviderConnectionInitialization: false,
  containerProviderConnectionCreationDisplayName: 'Podman machine',
  kubernetesProviderConnectionInitialization: false,
  extensionId: '',
  cleanupSupport: false,
};

const closeCallback = vi.fn();
const doCreateNew = vi.fn();

test('Expect to call closeCallback if clicking on Close', async () => {
  render(PreferencesProviderInstallationModal, {
    providerToBeInstalled: {
      provider: providerInfo,
      displayName: 'provider',
    },
    closeCallback,
    doCreateNew,
    preflightChecks: [],
  });

  const button = screen.getByRole('button', { name: 'Close' });
  expect(button).toBeInTheDocument();

  await userEvent.click(button);
  expect(closeCallback).toBeCalled;
});

test('Expect to call closeCallback if clicking on Cancel', async () => {
  render(PreferencesProviderInstallationModal, {
    providerToBeInstalled: {
      provider: providerInfo,
      displayName: 'provider',
    },
    closeCallback,
    doCreateNew,
    preflightChecks: [],
  });

  const button = screen.getByRole('button', { name: 'Cancel' });
  expect(button).toBeInTheDocument();

  await userEvent.click(button);
  expect(closeCallback).toBeCalled;
});

test('Expect to call doCreateNew if clicking on Next', async () => {
  render(PreferencesProviderInstallationModal, {
    providerToBeInstalled: {
      provider: providerInfo,
      displayName: 'provider',
    },
    closeCallback,
    doCreateNew,
    preflightChecks: [],
  });

  const button = screen.getByRole('button', { name: 'Next' });
  expect(button).toBeInTheDocument();

  await userEvent.click(button);
  expect(doCreateNew).toBeCalled;
});

test('Expect no modal if providerToBeInstalled is undefined', async () => {
  render(PreferencesProviderInstallationModal, {
    providerToBeInstalled: undefined,
    closeCallback,
    doCreateNew,
    preflightChecks: [],
  });

  const modal = screen.queryByLabelText('install provider');
  expect(modal).not.toBeInTheDocument();
});

test('Expect preflight check entry if preflights checks has some value', async () => {
  render(PreferencesProviderInstallationModal, {
    providerToBeInstalled: {
      provider: providerInfo,
      displayName: 'provider',
    },
    closeCallback,
    doCreateNew,
    preflightChecks: [
      {
        name: 'check',
        description: 'description',
      },
    ],
  });

  const span = screen.getByLabelText('description');
  expect(span).toBeInTheDocument();
});
