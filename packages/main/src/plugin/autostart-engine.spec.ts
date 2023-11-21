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

import { beforeAll, beforeEach, expect, test, vi } from 'vitest';
import type { IConfigurationNode } from './configuration-registry.js';
import { ConfigurationRegistry } from './configuration-registry.js';
import type { Directories } from './directories.js';
import type { ProviderRegistry } from './provider-registry.js';
import { AutostartEngine } from './autostart-engine.js';
import type { Configuration } from '@podman-desktop/api';
import { CONFIGURATION_DEFAULT_SCOPE, CONFIGURATION_ONBOARDING_SCOPE } from './configuration-registry-constants.js';
import type { ApiSenderType } from '/@/plugin/api.js';

let configurationRegistry: ConfigurationRegistry;
let providerRegistry: ProviderRegistry;
let autostartEngine: AutostartEngine;

const extensionId = 'id';
const extensionDisplayName = 'name';

const mockRegisterConfiguration = vi.fn();
const mockRunAutostart = vi.fn().mockResolvedValue('');

beforeEach(() => {
  vi.clearAllMocks();
});

/* eslint-disable @typescript-eslint/no-empty-function */
beforeAll(() => {
  configurationRegistry = new ConfigurationRegistry({} as ApiSenderType, {} as Directories);
  providerRegistry = {} as unknown as ProviderRegistry;
  autostartEngine = new AutostartEngine(configurationRegistry, providerRegistry);
  configurationRegistry.registerConfigurations = mockRegisterConfiguration;
  configurationRegistry.deregisterConfigurations = vi.fn();
  providerRegistry.runAutostart = mockRunAutostart;
});

test('Check that default value is false if provider autostart setting is false', async () => {
  vi.spyOn(configurationRegistry, 'getConfiguration').mockImplementation(() => {
    return {
      get: (_section: string, _defaultValue: boolean) => false,
    } as Configuration;
  });

  const autoStartConfigurationNode: IConfigurationNode = {
    id: `preferences.${extensionId}.engine.autostart`,
    title: `Autostart ${extensionDisplayName} engine`,
    type: 'object',
    extension: {
      id: extensionId,
    },
    properties: {
      [`preferences.${extensionId}.engine.autostart`]: {
        description: `Autostart ${extensionDisplayName} engine when launching Podman Desktop`,
        type: 'boolean',
        default: false,
        scope: [CONFIGURATION_DEFAULT_SCOPE, CONFIGURATION_ONBOARDING_SCOPE],
      },
    },
  };

  const disposable = autostartEngine.registerProvider(extensionId, extensionDisplayName, 'internalId');
  disposable.dispose();
  expect(mockRegisterConfiguration).toBeCalledWith([autoStartConfigurationNode]);
});

test('Check that default value is true if provider autostart setting is not set', async () => {
  vi.spyOn(configurationRegistry, 'getConfiguration').mockImplementation(() => {
    return {
      get: (_section: string, defaultValue: boolean) => defaultValue,
    } as Configuration;
  });

  const autoStartConfigurationNode: IConfigurationNode = {
    id: `preferences.${extensionId}.engine.autostart`,
    title: `Autostart ${extensionDisplayName} engine`,
    type: 'object',
    extension: {
      id: extensionId,
    },
    properties: {
      [`preferences.${extensionId}.engine.autostart`]: {
        description: `Autostart ${extensionDisplayName} engine when launching Podman Desktop`,
        type: 'boolean',
        default: true,
        scope: [CONFIGURATION_DEFAULT_SCOPE, CONFIGURATION_ONBOARDING_SCOPE],
      },
    },
  };

  const disposable = autostartEngine.registerProvider(extensionId, extensionDisplayName, 'internalId');
  disposable.dispose();

  expect(mockRegisterConfiguration).toBeCalledWith([autoStartConfigurationNode]);
});

test('Check that runAutostart is called once if only one provider has registered autostart process', async () => {
  vi.spyOn(configurationRegistry, 'getConfiguration').mockImplementation(() => {
    return {
      get: (_section: string, _defaultValue: boolean) => true,
    } as Configuration;
  });

  const disposable = autostartEngine.registerProvider(extensionId, extensionDisplayName, 'internalId');
  await autostartEngine.start();

  disposable.dispose();
  expect(mockRunAutostart).toBeCalledTimes(1);
  expect(mockRunAutostart).toBeCalledWith('internalId');
});

test('Check that runAutostart is never called if only one provider has registered autostart process but its setting is false', async () => {
  vi.spyOn(configurationRegistry, 'getConfiguration').mockImplementation(() => {
    return {
      get: (_section: string, _defaultValue: boolean) => false,
    } as Configuration;
  });

  const disposable = autostartEngine.registerProvider(extensionId, extensionDisplayName, 'internalId');

  await autostartEngine.start();

  disposable.dispose();
  expect(mockRunAutostart).toBeCalledTimes(0);
});

test('Check that runAutostart is called twice if only two providers has registered autostart process', async () => {
  vi.spyOn(configurationRegistry, 'getConfiguration').mockImplementation(() => {
    return {
      get: (_section: string, _defaultValue: boolean) => true,
    } as Configuration;
  });

  const disposable1 = autostartEngine.registerProvider(extensionId, extensionDisplayName, 'internalId1');
  const disposable2 = autostartEngine.registerProvider(extensionId, extensionDisplayName, 'internalId2');

  await autostartEngine.start();

  disposable1.dispose();
  disposable2.dispose();
  expect(mockRunAutostart).toBeCalledTimes(2);
  expect(mockRunAutostart).toHaveBeenNthCalledWith(1, 'internalId1');
  expect(mockRunAutostart).toHaveBeenLastCalledWith('internalId2');
});
