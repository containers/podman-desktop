/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { beforeAll, expect, test, vi } from 'vitest';

import type { ApiSenderType } from '../api.js';
import { ConfigurationRegistry } from '../configuration-registry.js';
import type { Directories } from '../directories.js';
import { DockerCompatibility } from './docker-compatibility.js';

let configurationRegistry: ConfigurationRegistry;

/* eslint-disable @typescript-eslint/no-empty-function */
beforeAll(() => {
  configurationRegistry = new ConfigurationRegistry({} as ApiSenderType, {} as Directories);
  configurationRegistry.registerConfigurations = vi.fn();
  configurationRegistry.deregisterConfigurations = vi.fn();
});

test('should register a configuration', async () => {
  const appearanceInit = new DockerCompatibility(configurationRegistry);
  appearanceInit.init();

  expect(configurationRegistry.registerConfigurations).toBeCalled();
  const configurationNode = vi.mocked(configurationRegistry.registerConfigurations).mock.calls[0]?.[0][0];
  expect(configurationNode?.id).toBe('preferences.experimental.dockerCompatibility');
  expect(configurationNode?.title).toBe('Experimental (Docker Compatibility)');
  expect(configurationNode?.properties).toBeDefined();
  expect(Object.keys(configurationNode?.properties ?? {}).length).toBe(1);
  expect(configurationNode?.properties?.[DockerCompatibility.ENABLED_FULL_KEY]).toBeDefined();
  expect(configurationNode?.properties?.[DockerCompatibility.ENABLED_FULL_KEY]?.type).toBe('boolean');
  expect(configurationNode?.properties?.[DockerCompatibility.ENABLED_FULL_KEY]?.default).toBeFalsy();
  expect(configurationNode?.properties?.[DockerCompatibility.ENABLED_FULL_KEY]?.hidden).toBeTruthy();
});
