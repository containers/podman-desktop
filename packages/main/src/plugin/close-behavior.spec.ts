/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { beforeEach, expect, test, vi } from 'vitest';

import * as util from '/@/util.js';

import { CloseBehavior } from './close-behavior.js';
import { ConfigurationRegistry } from './configuration-registry.js';
import type { DefaultConfiguration } from './default-configuration.js';
import type { Directories } from './directories.js';
import type { LockedConfiguration } from './locked-configuration.js';

vi.mock(import('/@/util.js'), () => {
  return {
    isUnixLike: vi.fn(),
  };
});

let closeBehavior: CloseBehavior;
let configurationRegistry: ConfigurationRegistry;

beforeEach(() => {
  configurationRegistry = new ConfigurationRegistry(
    {} as ApiSenderType,
    {} as Directories,
    {} as DefaultConfiguration,
    {} as LockedConfiguration,
  );
  closeBehavior = new CloseBehavior(configurationRegistry);
});

test('should register a configuration', async () => {
  const before = configurationRegistry.getConfigurationProperties()['preferences.ExitOnClose'];
  expect(before).toBeUndefined();
  await closeBehavior.init();
  const after = configurationRegistry.getConfigurationProperties()['preferences.ExitOnClose'];
  expect(after).toBeDefined();
});

test('should set default value of configuration registry on Linux and FreeBSD to true', async () => {
  vi.spyOn(util, 'isUnixLike').mockReturnValue(true);
  await closeBehavior.init();
  expect(configurationRegistry.getConfigurationProperties()['preferences.ExitOnClose']?.default).toBeTruthy();
});

test('should set default value of configuration registry if not Linux or FreeBSD', async () => {
  vi.spyOn(util, 'isUnixLike').mockReturnValue(false);
  await closeBehavior.init();
  expect(configurationRegistry.getConfigurationProperties()['preferences.ExitOnClose']?.default).toBeFalsy();
});
