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
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { beforeEach, expect, test } from 'vitest';

import { ConfigurationRegistry } from './configuration-registry.js';
import type { Context } from './context/context.js';
import type { DefaultConfiguration } from './default-configuration.js';
import type { Directories } from './directories.js';
import type { LockedConfiguration } from './locked-configuration.js';
import { TrayVisibility } from './tray-visibility.js';

let trayVisibility: TrayVisibility;
let configurationRegistry: ConfigurationRegistry;

beforeEach(() => {
  configurationRegistry = new ConfigurationRegistry(
    {} as ApiSenderType,
    {} as Directories,
    {} as DefaultConfiguration,
    {} as LockedConfiguration,
    {} as Context,
  );
  trayVisibility = new TrayVisibility(configurationRegistry);
});

test('should register a configuration', async () => {
  const before = configurationRegistry.getConfigurationProperties()['preferences.ShowTrayIcon'];
  expect(before).toBeUndefined();
  await trayVisibility.init();
  const after = configurationRegistry.getConfigurationProperties()['preferences.ShowTrayIcon'];
  expect(after).toBeDefined();
});

test('should set default value to true', async () => {
  await trayVisibility.init();
  expect(configurationRegistry.getConfigurationProperties()['preferences.ShowTrayIcon']?.default).toBe(true);
});
