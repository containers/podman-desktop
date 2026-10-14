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

import { Buffer } from 'node:buffer';

import type { ProviderInfo } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { providerInfos } from '/@/stores/providers';

import * as PreferencesConnectionCreationRendering from './PreferencesConnectionCreationOrEditRendering.svelte';
import PreferencesContainerConnectionEdit from './PreferencesContainerConnectionEdit.svelte';

vi.mock(import('./PreferencesConnectionCreationOrEditRendering.svelte'));

const EMPTY_PROVIDER_MOCK: ProviderInfo = {
  id: 'podman',
  name: 'podman',
  images: {
    icon: 'img',
  },
  status: 'started',
  warnings: [],
  containerProviderConnectionCreation: true,
  detectionChecks: [],
  installationSupport: false,
  internalId: '0',
  containerConnections: [],
  kubernetesConnections: [],
  kubernetesProviderConnectionCreation: true,
  vmConnections: [],
  vmProviderConnectionCreation: false,
  vmProviderConnectionInitialization: false,
  links: [],
  containerProviderConnectionInitialization: false,
  containerProviderConnectionCreationDisplayName: 'Podman machine',
  kubernetesProviderConnectionInitialization: false,
  extensionId: '',
  cleanupSupport: false,
  canStart: false,
  canStop: false,
};

const WARNING_MESSAGE =
  'This may restart the container or Kubernetes engine. Existing containers or pods may be stopped.';

function createProvider(connectionStatus: 'started' | 'stopped', connectionName = 'podman machine'): ProviderInfo {
  return {
    ...EMPTY_PROVIDER_MOCK,
    containerConnections: [
      {
        connectionType: 'container',
        name: connectionName,
        displayName: connectionName,
        status: connectionStatus,
        endpoint: {
          socketPath: '/tmp/podman.sock',
        },
        type: 'podman',
        canStart: false,
        canStop: false,
        canEdit: true,
        canDelete: false,
      },
    ],
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  providerInfos.set([]);
});

describe('PreferencesContainerConnectionEdit', () => {
  test('displays the connection name as page title', () => {
    const connectionName = 'podman machine';
    providerInfos.set([createProvider('started', connectionName)]);

    render(PreferencesContainerConnectionEdit, {
      providerInternalId: '0',
      name: Buffer.from(connectionName).toString('base64'),
      properties: [],
    });

    screen.getByRole('heading', { name: connectionName, level: 1 });
  });

  test('shows restart warning when connection is started', () => {
    const connectionName = 'podman machine';
    providerInfos.set([createProvider('started', connectionName)]);

    render(PreferencesContainerConnectionEdit, {
      providerInternalId: '0',
      name: Buffer.from(connectionName).toString('base64'),
    });

    expect(screen.getByRole('alert')).toHaveTextContent(WARNING_MESSAGE);
  });

  test('does not show restart warning when connection is stopped', () => {
    const connectionName = 'podman machine';
    providerInfos.set([createProvider('stopped', connectionName)]);

    render(PreferencesContainerConnectionEdit, {
      providerInternalId: '0',
      name: Buffer.from(connectionName).toString('base64'),
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('does not render details when connection name does not match', () => {
    providerInfos.set([createProvider('started', 'podman machine')]);

    render(PreferencesContainerConnectionEdit, {
      providerInternalId: '0',
      name: Buffer.from('unknown machine').toString('base64'),
    });

    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(PreferencesConnectionCreationRendering.default).not.toHaveBeenCalled();
  });

  test('passes ContainerConnection scope and connection info to creation form', () => {
    const connectionName = 'podman machine';
    const properties: IConfigurationPropertyRecordedSchema[] = [
      {
        id: 'test.property',
        title: 'Test',
        parentId: '',
        description: 'test property',
        scope: 'ContainerConnection',
      },
    ];
    const providerInfo = createProvider('started', connectionName);
    providerInfos.set([providerInfo]);

    render(PreferencesContainerConnectionEdit, {
      providerInternalId: '0',
      name: Buffer.from(connectionName).toString('base64'),
      properties,
    });

    expect(PreferencesConnectionCreationRendering.default).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        providerInfo,
        connectionInfo: providerInfo.containerConnections[0],
        properties,
        propertyScope: 'ContainerConnection',
        callback: expect.any(Function),
      }),
    );
  });
});
