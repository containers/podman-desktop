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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import '@testing-library/jest-dom';
import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import PreferencesResourcesRendering from './PreferencesResourcesRendering.svelte';
import { providerInfos } from '../../stores/providers';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import PreferencesContainerConnectionRendering from './PreferencesContainerConnectionRendering.svelte';

test('Expect that the right machine is displayed', async () => {
  const socketPath = '/my/common-socket-path';
  const podmanMachineName1 = 'podman machine 1';
  const podmanMachineName2 = 'podman machine 2';
  const podmanMachineName3 = 'podman machine 3';

  const providerInfo: ProviderInfo = {
    id: 'podman',
    name: 'podman',
    images: {
      icon: 'img',
    },
    status: 'started',
    warnings: undefined,
    containerProviderConnectionCreation: true,
    detectionChecks: undefined,
    containerConnections: [
      {
        name: podmanMachineName1,
        status: 'started',
        endpoint: {
          socketPath,
        },
        type: 'podman',
      },
      {
        name: podmanMachineName2,
        status: 'started',
        endpoint: {
          socketPath,
        },
        type: 'podman',
      },
      {
        name: podmanMachineName3,
        status: 'started',
        endpoint: {
          socketPath,
        },
        type: 'podman',
      },
    ],
    installationSupport: undefined,
    internalId: '0',
    kubernetesConnections: [],
    kubernetesProviderConnectionCreation: true,
    links: undefined,
    containerProviderConnectionInitialization: false,
    containerProviderConnectionCreationDisplayName: 'Podman machine',
    kubernetesProviderConnectionInitialization: false,
  };

  // 3 connections with the same socket path
  providerInfos.set([providerInfo]);

  // encode name with base64 of the second machine
  const name = Buffer.from(podmanMachineName2).toString('base64');

  const connection = Buffer.from(socketPath).toString('base64');

  render(PreferencesContainerConnectionRendering, {
    name,
    connection,
    providerInternalId: '0',
  });

  // expect to have the second machine being displayed (and not the first one that also match socket path)
  const title = screen.getByRole('heading', { name: 'podman machine 2', level: 1 });
  expect(title).toBeInTheDocument();
});
