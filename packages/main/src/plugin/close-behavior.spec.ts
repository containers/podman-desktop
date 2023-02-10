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
import { afterEach, beforeEach, vi, test, expect } from 'vitest';
import { CloseBehavior } from './close-behavior';
import type { IConfigurationNode } from './configuration-registry';
import { ConfigurationRegistry } from './configuration-registry';
import type { ProviderRegistry } from './provider-registry';
import { isLinux } from '../util';

const providerRegistry = {} as ProviderRegistry;
// ToDo: candidate for a snapshot usage, maybe even using mock for the whole init method to simulate hard coded object
const closeBehaviorConfigurationNode: IConfigurationNode = {
  id: 'preferences.ExitOnClose',
  title: 'Exit On Close',
  type: 'object',
  properties: {
    ['preferences.ExitOnClose']: {
      description: 'Quit the app when the close button is clicked instead of minimizing to the tray.',
      type: 'boolean',
      default: isLinux,
    },
  },
};
let closeBehavior;
let configurationRegistry;

beforeEach(() => {
  configurationRegistry = new ConfigurationRegistry();
  closeBehavior = new CloseBehavior(configurationRegistry, providerRegistry);
});

afterEach(() => {
  vi.clearAllMocks();
});

test('should register specific configuration node object via configuration registry method call', () => {
  const spy = vi.spyOn(configurationRegistry, 'registerConfigurations');
  closeBehavior.init();
  expect(spy).toBeCalled();
  expect(spy).toHaveBeenCalledWith([closeBehaviorConfigurationNode]);
});
