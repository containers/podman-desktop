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

import { existsSync } from 'node:fs';
import * as promises from 'node:fs/promises';
import path from 'node:path';

import type {
  ContainerInfo,
  ExploreFeature,
  ExtensionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '@desktop-framework/api';
import type { Configuration } from '@desktop-framework/extension-api';
import { beforeEach, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import type { ContainerProviderRegistry } from '/@/plugin/container-registry.js';
import type { Context } from '/@/plugin/context/context.js';
import type { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';
import type { KubernetesClient } from '/@/plugin/kubernetes/kubernetes-client.js';
import type { ProviderRegistry } from '/@/plugin/provider-registry.js';

import { ExploreFeatures } from './explore-features.js';

vi.mock(import('node:fs'), () => ({
  existsSync: vi.fn(),
}));
vi.mock(import('node:fs/promises'), () => ({
  readFile: vi.fn(),
}));

const configurationRegistryMock = {
  getConfiguration: vi.fn().mockReturnValue({
    get: vi.fn(),
  }),
  updateConfigurationValue: vi.fn(),
  registerConfigurations: vi.fn(),
} as unknown as ConfigurationRegistry;

const containerProviderRegistryMock = {
  listContainers: vi.fn(),
} as unknown as ContainerProviderRegistry;

const extensionLoaderMock = {
  listExtensions: vi.fn(),
} as unknown as ExtensionLoader;

const providerRegistryMock = {
  getProviderInfos: vi.fn(),
} as unknown as ProviderRegistry;

const kubernetesClientMock = {
  getContextsGeneralState: vi.fn(),
} as unknown as KubernetesClient;

const contextMock = {
  setValue: vi.fn(),
} as unknown as Context;

const containerInfoMock: ContainerInfo = {
  Id: '1234567890',
  Names: ['/container1'],
  Image: 'image1',
  ImageID: 'image1',
  Command: 'command1',
  Created: 1234567890,
  State: 'running',
  Status: 'running',
  engineId: 'engine1',
  engineName: 'engine 1',
  engineType: 'podman',
  Ports: [],
  Labels: {},
  StartedAt: '',
  ImageBase64RepoTag: '',
};

const providerInfoMock: ProviderInfo = {
  internalId: 'provider1',
  id: 'provider1',
  extensionId: 'extension1',
  name: 'provider 1',
  containerConnections: [
    {
      connectionType: 'container',
      name: 'connection1',
      displayName: 'Connection 1',
      status: 'started',
      endpoint: {
        socketPath: '',
      },
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
      type: 'podman',
    },
  ],
  kubernetesConnections: [],
  vmConnections: [],
  status: 'ready',
  containerProviderConnectionCreation: false,
  containerProviderConnectionInitialization: false,
  kubernetesProviderConnectionCreation: false,
  kubernetesProviderConnectionInitialization: false,
  vmProviderConnectionCreation: false,
  vmProviderConnectionInitialization: false,
  links: [],
  detectionChecks: [],
  warnings: [],
  images: {},
  installationSupport: false,
  cleanupSupport: false,
  canStart: false,
  canStop: false,
};

const extensionInfoMock: ExtensionInfo = {
  id: 'extensionMock',
  name: 'extension mock',
  description: '',
  displayName: 'Extension Mock',
  publisher: '',
  removable: false,
  devMode: false,
  bundled: false,
  version: '',
  state: '',
  path: '',
  readme: '',
};

const exploreFeaturesMock = new ExploreFeatures(
  containerProviderRegistryMock,
  extensionLoaderMock,
  configurationRegistryMock,
  providerRegistryMock,
  kubernetesClientMock,
  contextMock,
);

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue({
    get: vi.fn().mockImplementation((key: string): unknown => {
      if (key === 'hiddenFeatures') {
        return [];
      } else if (key === 'enabled') {
        return false;
      }
      return undefined;
    }),
  } as unknown as Configuration);

  vi.mocked(containerProviderRegistryMock.listContainers).mockResolvedValue([]);
  vi.mocked(extensionLoaderMock.listExtensions).mockResolvedValue([]);

  vi.mocked(providerRegistryMock.getProviderInfos).mockReturnValue([providerInfoMock]);

  vi.mocked(kubernetesClientMock.getContextsGeneralState).mockReturnValue(new Map());

  vi.mocked(promises.readFile).mockResolvedValue('some data');
});

test('init explore features in the configuration registry', async () => {
  await exploreFeaturesMock.init();

  expect(configurationRegistryMock.registerConfigurations).toBeCalled();
  const configurationNode = vi.mocked(configurationRegistryMock.registerConfigurations).mock.calls[0]?.[0][0];
  expect(configurationNode?.id).toBe('exploreFeatures');
  expect(configurationNode?.title).toBe('Show explore features content');
  expect(configurationNode?.properties).toBeDefined();
  expect(Object.keys(configurationNode?.properties ?? {}).length).toBe(2);
  expect(configurationNode?.properties?.['exploreFeatures.expanded']).toBeDefined();
  expect(configurationNode?.properties?.['exploreFeatures.expanded']?.type).toBe('boolean');
  expect(configurationNode?.properties?.['exploreFeatures.expanded']?.default).toBe(true);
  expect(configurationNode?.properties?.['exploreFeatures.expanded']?.hidden).toBe(true);

  expect(configurationNode?.properties?.['exploreFeatures.hiddenFeatures']).toBeDefined();
  expect(configurationNode?.properties?.['exploreFeatures.hiddenFeatures']?.type).toBe('array');
  expect(configurationNode?.properties?.['exploreFeatures.hiddenFeatures']?.hidden).toBe(true);
});

test('Get features list', async () => {
  vi.mocked(containerProviderRegistryMock.listContainers).mockResolvedValue([]);

  vi.mocked(providerRegistryMock.getProviderInfos).mockReturnValue([]);

  vi.mocked(extensionLoaderMock.listExtensions).mockResolvedValue([]);

  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue({
    get: vi.fn().mockImplementation((key: string): unknown => {
      if (key === 'hiddenFeatures') {
        return [];
      } else if (key === 'enabled') {
        return false;
      }
      return undefined;
    }),
  } as unknown as Configuration);
  await exploreFeaturesMock.init();
  const features = await exploreFeaturesMock.downloadFeaturesList();

  expect(features.length).toBe(4);

  // all features show by default
  expect(features[0]?.show).toBe(true);
  expect(features[1]?.show).toBe(true);
  expect(features[2]?.show).toBe(true);
  expect(features[3]?.show).toBe(true);

  // all features be checked for image file
  expect(vi.mocked(existsSync)).toBeCalledWith(
    path.resolve(ExploreFeatures.MAIN_IMAGES_FOLDER, `${features[0]?.id}.png`),
  );
  expect(vi.mocked(existsSync)).toBeCalledWith(
    path.resolve(ExploreFeatures.MAIN_IMAGES_FOLDER, `${features[1]?.id}.png`),
  );
  expect(vi.mocked(existsSync)).toBeCalledWith(
    path.resolve(ExploreFeatures.MAIN_IMAGES_FOLDER, `${features[2]?.id}.png`),
  );
  expect(vi.mocked(existsSync)).toBeCalledWith(
    path.resolve(ExploreFeatures.MAIN_IMAGES_FOLDER, `${features[3]?.id}.png`),
  );
});

test.each([
  (): Promise<ExploreFeature[]> => exploreFeaturesMock.downloadFeaturesList(),
  (): Promise<void> => exploreFeaturesMock.init(),
])('Context value are set when calling %s', async func => {
  vi.mocked(containerProviderRegistryMock.listContainers).mockResolvedValue([containerInfoMock]);

  vi.mocked(providerRegistryMock.getProviderInfos).mockReturnValue([
    providerInfoMock,
    { ...providerInfoMock, kubernetesConnections: [{} as unknown as ProviderKubernetesConnectionInfo] },
  ]);

  vi.mocked(extensionLoaderMock.listExtensions).mockResolvedValue([
    extensionInfoMock,
    { ...extensionInfoMock, removable: true },
  ]);

  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue({
    get: vi.fn().mockImplementation((key: string): unknown => {
      if (key === 'hiddenFeatures') {
        return [];
      } else if (key === 'enabled') {
        return false;
      }
      return undefined;
    }),
  } as unknown as Configuration);

  await func();

  expect(contextMock.setValue).toHaveBeenCalledWith('containerListLength', 1);
  expect(contextMock.setValue).toHaveBeenCalledWith('runningContainerConnections', 2);
  expect(contextMock.setValue).toHaveBeenCalledWith('kubernetesConnections', true);
  expect(contextMock.setValue).toHaveBeenCalledWith('reachableContexts', false);
  expect(contextMock.setValue).toHaveBeenCalledWith('installedExtensionsNumber', 1);
  expect(contextMock.setValue).toHaveBeenCalledWith('isDockerCompatibilityEnabled', false);
});

test('Do not show hidden features', async () => {
  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue({
    get: vi.fn().mockReturnValueOnce(['manage-docker', 'start-a-container']).mockReturnValueOnce(false),
  } as unknown as Configuration);

  const features = await exploreFeaturesMock.downloadFeaturesList();

  expect(configurationRegistryMock.getConfiguration).toHaveBeenCalledWith('exploreFeatures');
  expect(vi.mocked(configurationRegistryMock.getConfiguration).mock.results[0]?.value.get).toHaveBeenCalledWith(
    'hiddenFeatures',
    [],
  );

  expect(features[0]?.show).toBe(false);
  expect(features[3]?.show).toBe(false);
  expect(features[1]?.show).toBe(true);
  expect(features[2]?.show).toBe(true);
});

test('Closed feature card is added to hidden features', async () => {
  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue({
    get: vi.fn().mockReturnValue(['explore-kubernetes']),
  } as unknown as Configuration);

  await exploreFeaturesMock.closeFeatureCard('some-feature');

  expect(configurationRegistryMock.getConfiguration).toHaveBeenCalledWith('exploreFeatures');
  expect(vi.mocked(configurationRegistryMock.getConfiguration).mock.results[0]?.value.get).toHaveBeenCalledWith(
    'hiddenFeatures',
    [],
  );

  expect(configurationRegistryMock.updateConfigurationValue).toHaveBeenCalledWith('exploreFeatures.hiddenFeatures', [
    'explore-kubernetes',
    'some-feature',
  ]);
});
