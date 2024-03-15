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

import { beforeEach, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from './configuration-registry.js';
import { OpenDevToolsInit } from './open-devtools-init.js';

let openDevToolsInit: OpenDevToolsInit;

const registerConfigurationsMock = vi.fn();

const configurationRegistryMock = {
  registerConfigurations: registerConfigurationsMock,
} as unknown as ConfigurationRegistry;

beforeEach(() => {
  openDevToolsInit = new OpenDevToolsInit(configurationRegistryMock);
});
test('should register a configuration', async () => {
  // register configuration
  openDevToolsInit.init();

  // should be the directory provided as env var
  expect(configurationRegistryMock.registerConfigurations).toBeCalled();

  // take first argument of first call
  const configurationNode = vi.mocked(configurationRegistryMock).registerConfigurations.mock.calls[0][0][0];
  expect(configurationNode.id).toBe('preferences.OpenDevTools');
  expect(configurationNode.title).toBe('Open Dev Tools');
  expect(configurationNode.type).toBe('object');
  expect(configurationNode.properties).toBeDefined();
  expect(configurationNode.properties?.['preferences.OpenDevTools']).toBeDefined();
  expect(configurationNode.properties?.['preferences.OpenDevTools'].description).toBe(
    'Open DevTools when launching Podman Desktop in development mode.',
  );
  expect(configurationNode.properties?.['preferences.OpenDevTools'].type).toBe('string');
  expect(configurationNode.properties?.['preferences.OpenDevTools'].enum).toEqual([
    'left',
    'right',
    'bottom',
    'undocked',
    'detach',
    'none',
  ]);
  expect(configurationNode.properties?.['preferences.OpenDevTools'].default).toBe('undocked');
});
