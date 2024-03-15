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

import { ipcMain } from 'electron';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { TrayMenu } from '../tray-menu.js';
import type { ProviderInfo } from './api/provider-info.js';
import type { CommandRegistry } from './command-registry.js';
import type { ProviderRegistry } from './provider-registry.js';
import type { Telemetry } from './telemetry/telemetry.js';
import { TrayMenuRegistry } from './tray-menu-registry.js';

let menuRegistry: TrayMenuRegistry;
let trayMenu: TrayMenu;

vi.mock('electron', () => {
  return {
    ipcMain: {
      emit: vi.fn(),
      on: vi.fn(),
    },
  };
});

beforeAll(() => {
  trayMenu = {
    addProviderItems: vi.fn(),
    deleteProviderItem: vi.fn(),
  } as unknown as TrayMenu;
  const commandRegistry = {} as CommandRegistry;
  const providerRegistry = {
    addProviderListener: vi.fn(),
    addProviderLifecycleListener: vi.fn(),
    addProviderContainerConnectionLifecycleListener: vi.fn(),
  } as unknown as ProviderRegistry;
  const telemetryService = {} as Telemetry;
  menuRegistry = new TrayMenuRegistry(trayMenu, commandRegistry, providerRegistry, telemetryService);
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('Should pass proper providerId field', () => {
  const ipcEmit = vi.spyOn(ipcMain, 'emit');
  menuRegistry.registerProvider({
    internalId: 'internalId',
    id: 'testId',
  } as ProviderInfo);

  const menuItem = { id: 'itemId' };
  menuRegistry.registerProviderMenuItem('testId', menuItem);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastIpcArguments = ipcEmit.mock.lastCall!;
  expect(lastIpcArguments).is.not.undefined;
  expect(lastIpcArguments[0]).eqls('tray:add-provider-menu-item');
  expect(lastIpcArguments[1]).eqls('');
  expect(lastIpcArguments[2]).eqls({ providerId: 'testId', menuItem: menuItem });
});

test('Should remove menu item on dispose', () => {
  const deleteItem = vi.spyOn(trayMenu, 'deleteProviderItem');
  menuRegistry.registerProvider({
    internalId: 'internalId',
    id: 'testId',
  } as ProviderInfo);

  const menuItem = { id: 'itemId' };
  const disposable = menuRegistry.registerProviderMenuItem('testId', menuItem);
  disposable.dispose();

  expect(deleteItem.mock.calls).length(1);
  expect(deleteItem.mock.lastCall).eqls(['testId', 'itemId']);
});
