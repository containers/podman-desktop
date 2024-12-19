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

import { expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from './configuration-registry.js';
import { LearningCenterInit } from './learning-center-init.js';

let learningCenterInit: LearningCenterInit;

const registerConfigurationsMock = vi.fn();

const configurationRegistryMock = {
  registerConfigurations: registerConfigurationsMock,
} as unknown as ConfigurationRegistry;

test('should register configuration', async () => {
  learningCenterInit = new LearningCenterInit(configurationRegistryMock);

  learningCenterInit.init();

  expect(configurationRegistryMock.registerConfigurations).toBeCalled();

  const configurationNode = vi.mocked(configurationRegistryMock.registerConfigurations).mock.calls[0]?.[0][0];
  expect(configurationNode?.id).toBe('learningCenter');
  expect(configurationNode?.title).toBe('Show learning center content');
  expect(configurationNode?.properties).toBeDefined();
  expect(Object.keys(configurationNode?.properties ?? {}).length).toBe(1);
  expect(configurationNode?.properties?.['learningCenter.expanded']).toBeDefined();
  expect(configurationNode?.properties?.['learningCenter.expanded']?.type).toBe('boolean');
  expect(configurationNode?.properties?.['learningCenter.expanded']?.default).toBe(true);
  expect(configurationNode?.properties?.['learningCenter.expanded']?.hidden).toBe(true);
});
