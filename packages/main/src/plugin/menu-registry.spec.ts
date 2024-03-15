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

import { beforeEach, expect, expectTypeOf, test, vi } from 'vitest';

import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';

import type { ApiSenderType } from './api.js';
import { CommandRegistry } from './command-registry.js';
import { MenuRegistry } from './menu-registry.js';
import type { Disposable } from './types/disposable.js';

let menuRegistry: MenuRegistry;
let commandRegistry: CommandRegistry;

let registerMenuDisposable: Disposable;

/* eslint-disable @typescript-eslint/no-empty-function */
beforeEach(() => {
  commandRegistry = new CommandRegistry(
    {
      send: vi.fn(),
    } as unknown as ApiSenderType,
    {} as Telemetry,
  );
  menuRegistry = new MenuRegistry(commandRegistry);
  const manifest = {
    contributes: {
      menus: {
        'dashboard/image': [
          {
            command: 'image.command1',
            title: 'Image 1',
          },
        ],
        'dashboard/container': [
          {
            command: 'container.command1',
            title: 'Container 1',
          },
          {
            command: 'container.command2',
            title: 'Container 2',
          },
        ],
        'dashboard/unregistered': [
          {
            command: 'unregistered.command1',
            title: 'Unregistered 1',
          },
        ],
      },
    },
  };
  registerMenuDisposable = menuRegistry.registerMenus(manifest.contributes.menus);
  commandRegistry.registerCommand('image.command1', () => {});
  commandRegistry.registerCommand('container.command1', () => {});
  commandRegistry.registerCommand('container.command2', () => {});
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('Should return empty array for unknown context', async () => {
  const menus = menuRegistry.getContributedMenus('unknownContext');
  expect(menus).toBeDefined();
  expectTypeOf(menus).toBeArray();
  expect(menus.length).toBe(0);
});

test('Image context should have a single entry', async () => {
  const menus = menuRegistry.getContributedMenus('dashboard/image');
  expect(menus).toBeDefined();
  expectTypeOf(menus).toBeArray();
  expect(menus.length).toBe(1);
  expect(menus[0].command).toBe('image.command1');
  expect(menus[0].title).toBe('Image 1');
});

test('Container context should have two entries', async () => {
  const menus = menuRegistry.getContributedMenus('dashboard/container');
  expect(menus).toBeDefined();
  expectTypeOf(menus).toBeArray();
  expect(menus.length).toBe(2);
  expect(menus[0].command).toBe('container.command1');
  expect(menus[0].title).toBe('Container 1');
  expect(menus[1].command).toBe('container.command2');
  expect(menus[1].title).toBe('Container 2');
});

test('Menus with unregistered commands should not be returned', async () => {
  const menus = menuRegistry.getContributedMenus('dashboard/unregistered');
  expect(menus).toBeDefined();
  expectTypeOf(menus).toBeArray();
  expect(menus.length).toBe(0);
});

test('Should not find menus after dispose', async () => {
  registerMenuDisposable.dispose();
  const menus = menuRegistry.getContributedMenus('dashboard/image');
  expect(menus).toStrictEqual([]);
});

test('Should find icon', async () => {
  menuRegistry = new MenuRegistry(commandRegistry);

  const manifest = {
    contributes: {
      menus: {
        'dashboard/image': [
          {
            command: 'image.command1',
            title: 'Image 1',
            icon: '${myIcon1}',
          },
        ],
        'dashboard/container': [
          {
            command: 'container.command1',
            title: 'Container 1',
            icon: '${myIcon2}',
          },
          {
            command: 'container.command2',
            title: 'Container 2',
          },
        ],
        'dashboard/unregistered': [
          {
            command: 'unregistered.command1',
            title: 'Unregistered 1',
          },
        ],
      },
    },
  };

  // commands are already registered
  // register the menus now
  registerMenuDisposable = menuRegistry.registerMenus(manifest.contributes.menus);

  const menus = menuRegistry.getContributedMenus('dashboard/image');

  // icon should be set for the command
  expect(menus[0].icon).toBe('${myIcon1}');

  const menus2 = menuRegistry.getContributedMenus('dashboard/container');
  // check icons
  expect(menus2[0].icon).toBe('${myIcon2}');
  // other one should be undefined
  expect(menus2[1].icon).toBe(undefined);

  // and now last item should be undefined as commands is not registered
  const menus3 = menuRegistry.getContributedMenus('dashboard/unregistered');
  expect(menus3).toStrictEqual([]);
});
