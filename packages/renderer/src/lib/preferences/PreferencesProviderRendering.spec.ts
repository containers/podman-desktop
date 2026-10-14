/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { ProviderInfo } from '@desktop-framework/api';
import { render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { providerInfos } from '/@/stores/providers';

import * as PreferencesConnectionCreationRendering from './PreferencesConnectionCreationOrEditRendering.svelte';
import PreferencesProviderRendering from './PreferencesProviderRendering.svelte';

const defaultProviderInfo = {
  id: 'test',
  internalId: 'id',
  name: 'provider default name',
  containerConnections: [],
  kubernetesConnections: undefined,
  status: 'started',
  containerProviderConnectionCreation: false,
  containerProviderConnectionInitialization: false,
  kubernetesProviderConnectionCreation: false,
  kubernetesProviderConnectionInitialization: false,
  links: undefined,
  detectionChecks: undefined,
  warnings: undefined,
  images: undefined,
  installationSupport: undefined,
} as unknown as ProviderInfo;

vi.mock(import('./PreferencesConnectionCreationOrEditRendering.svelte'));

describe.each<{
  name: string;
  setProviderInfo: (providerInfo: ProviderInfo) => void;
  expectedTitle: string;
  expectedPropertyScope: string;
  expectedCallback: unknown;
}>([
  {
    name: 'container provider without display name',
    setProviderInfo: (providerInfo: ProviderInfo): void => {
      providerInfo.containerProviderConnectionCreation = true;
    },
    expectedTitle: 'Create provider default name',
    expectedPropertyScope: 'ContainerProviderConnectionFactory',
    expectedCallback: window.createContainerProviderConnection,
  },
  {
    name: 'container provider with display name',
    setProviderInfo: (providerInfo: ProviderInfo): void => {
      providerInfo.containerProviderConnectionCreation = true;
      providerInfo.containerProviderConnectionCreationDisplayName = 'container Provider 1';
    },
    expectedTitle: 'Create container Provider 1',
    expectedPropertyScope: 'ContainerProviderConnectionFactory',
    expectedCallback: window.createContainerProviderConnection,
  },
  {
    name: 'kubernetes provider without display name',
    setProviderInfo: (providerInfo: ProviderInfo): void => {
      providerInfo.kubernetesProviderConnectionCreation = true;
    },
    expectedTitle: 'Create provider default name',
    expectedPropertyScope: 'KubernetesProviderConnectionFactory',
    expectedCallback: window.createKubernetesProviderConnection,
  },
  {
    name: 'kubernetes provider with display name',
    setProviderInfo: (providerInfo: ProviderInfo): void => {
      providerInfo.kubernetesProviderConnectionCreation = true;
      providerInfo.kubernetesProviderConnectionCreationDisplayName = 'Kubernetes Provider 1';
    },
    expectedTitle: 'Create Kubernetes Provider 1',
    expectedPropertyScope: 'KubernetesProviderConnectionFactory',
    expectedCallback: window.createKubernetesProviderConnection,
  },
  {
    name: 'VM provider without display name',
    setProviderInfo: (providerInfo: ProviderInfo): void => {
      providerInfo.vmProviderConnectionCreation = true;
    },
    expectedTitle: 'Create provider default name',
    expectedPropertyScope: 'VmProviderConnectionFactory',
    expectedCallback: window.createVmProviderConnection,
  },
  {
    name: 'VM provider with display name',
    setProviderInfo: (providerInfo: ProviderInfo): void => {
      providerInfo.vmProviderConnectionCreation = true;
      providerInfo.vmProviderConnectionCreationDisplayName = 'VM Provider 1';
    },
    expectedTitle: 'Create VM Provider 1',
    expectedPropertyScope: 'VmProviderConnectionFactory',
    expectedCallback: window.createVmProviderConnection,
  },
])('$name', ({ name: _name, setProviderInfo, expectedTitle, expectedPropertyScope, expectedCallback }) => {
  beforeEach(() => {
    const info = { ...defaultProviderInfo };
    setProviderInfo(info);
    providerInfos.set([info]);
    render(PreferencesProviderRendering, {
      providerInternalId: 'id',
    });
  });

  test('title', () => {
    screen.getByRole('heading', { name: expectedTitle });
  });

  test('PreferencesConnectionCreationRendering call', () => {
    expect(PreferencesConnectionCreationRendering.default).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        propertyScope: expectedPropertyScope,
        callback: expectedCallback,
      }),
    );
  });
});
