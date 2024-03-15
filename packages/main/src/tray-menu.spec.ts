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

import type { MenuItemConstructorOptions, Tray } from 'electron';
import { ipcMain, Menu, nativeImage } from 'electron';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import statusStopped from './assets/status-stopped.png';
import type { ProviderInfo } from './plugin/api/provider-info.js';
import type { AnimatedTray } from './tray-animate-icon.js';
import { TrayMenu } from './tray-menu.js';

let trayMenu: TrayMenu;
let tray: Tray;
let animatedTray: AnimatedTray;
vi.mock('electron', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Menu = {} as unknown as any;
  Menu['buildFromTemplate'] = vi.fn();
  return {
    Menu,
    ipcMain: {
      emit: vi.fn(),
      on: vi.fn(),
    },
    nativeImage: {
      createFromDataURL: vi.fn(),
    },
  };
});

beforeAll(() => {
  tray = {
    setContextMenu: vi.fn(),
  } as unknown as Tray;
  animatedTray = {
    setStatus: vi.fn(),
  } as unknown as AnimatedTray;
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('Tray delete provider item', () => {
  const onSpy = vi.spyOn(ipcMain, 'on');
  const menuBuild = vi.spyOn(Menu, 'buildFromTemplate');

  trayMenu = new TrayMenu(tray, animatedTray);

  trayMenu.addProviderItems({
    id: 'testId',
    name: 'TestProv',
    internalId: 'internalId',
  } as ProviderInfo);

  onSpy.mock.calls[0][1](undefined as unknown as Electron.IpcMainEvent, {
    providerId: 'testId',
    menuItem: { id: 'itemId', label: 'SomeLabel' },
  });

  trayMenu.deleteProviderItem('testId', 'itemId');
  expect(
    (menuBuild.mock.lastCall?.[0][0].submenu as Array<MenuItemConstructorOptions>)?.filter(
      it => it.label === 'SomeLabel',
    ),
  ).to.be.empty;
});

test('Tray update provider not delete provider items', () => {
  const onSpy = vi.spyOn(ipcMain, 'on');
  const menuBuild = vi.spyOn(Menu, 'buildFromTemplate');

  trayMenu = new TrayMenu(tray, animatedTray);

  trayMenu.addProviderItems({
    id: 'testId',
    name: 'TestProv',
    internalId: 'internalId',
  } as ProviderInfo);

  onSpy.mock.calls[0][1](undefined as unknown as Electron.IpcMainEvent, {
    providerId: 'testId',
    menuItem: { id: 'itemId', label: 'SomeLabel' },
  });

  trayMenu.addProviderItems({
    id: 'testId',
    name: 'TestProv',
    internalId: 'internalId',
  } as ProviderInfo);

  expect(
    (menuBuild.mock.lastCall?.[0][0].submenu as Array<MenuItemConstructorOptions>)?.filter(
      it => it.label === 'SomeLabel',
    ),
  ).to.be.not.empty;
});

test('Tray provider configured state same as stopped', () => {
  const menuBuild = vi.spyOn(Menu, 'buildFromTemplate');

  trayMenu = new TrayMenu(tray, animatedTray);

  trayMenu.addProviderItems({
    id: 'testId',
    name: 'TestProv',
    internalId: 'internalId',
    status: 'configured',
  } as ProviderInfo);

  expect((menuBuild.mock.lastCall?.[0][0] as MenuItemConstructorOptions).icon).eql(
    nativeImage.createFromDataURL(statusStopped),
  );
});

test('Tray provider start enabled when configured state', () => {
  const menuBuild = vi.spyOn(Menu, 'buildFromTemplate');

  trayMenu = new TrayMenu(tray, animatedTray);

  trayMenu.addProviderItems({
    id: 'testId',
    name: 'TestProv',
    internalId: 'internalId',
    status: 'configured',
  } as ProviderInfo);

  const startItem = (menuBuild.mock.lastCall?.[0][0].submenu as Array<MenuItemConstructorOptions>)?.find(
    it => it.label === 'Start',
  );
  expect(startItem).to.be.not.undefined;
  expect(startItem?.enabled).to.be.true;
});
