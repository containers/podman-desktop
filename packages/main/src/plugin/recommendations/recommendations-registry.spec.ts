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

import { beforeEach, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';

import { RecommendationsRegistry } from './recommendations-registry.js';

let recommendationsRegistry: RecommendationsRegistry;

const registerConfigurationsMock = vi.fn();

const configurationRegistryMock = {
  registerConfigurations: registerConfigurationsMock,
} as unknown as ConfigurationRegistry;

beforeEach(() => {
  recommendationsRegistry = new RecommendationsRegistry(configurationRegistryMock);
});
test('should register a configuration', async () => {
  // register configuration
  recommendationsRegistry.init();

  // should be the directory provided as env var
  expect(configurationRegistryMock.registerConfigurations).toBeCalled();

  // take first argument of first call
  const configurationNode = vi.mocked(configurationRegistryMock).registerConfigurations.mock.calls[0][0][0];
  expect(configurationNode.id).toBe('preferences.extensions');
  expect(configurationNode.title).toBe('Extensions');
  expect(configurationNode.type).toBe('object');
  expect(configurationNode.properties).toBeDefined();
  expect(configurationNode.properties?.['extensions.ignoreRecommendations']).toBeDefined();
  expect(configurationNode.properties?.['extensions.ignoreRecommendations'].description).toBe(
    'When enabled, the notifications for extension recommendations will not be shown.',
  );
  expect(configurationNode.properties?.['extensions.ignoreRecommendations'].type).toBe('boolean');
  expect(configurationNode.properties?.['extensions.ignoreRecommendations'].default).toBeFalsy();
});
