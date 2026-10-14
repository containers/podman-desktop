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

import type { ProviderInfo } from '@desktop-framework/api';
import type { MenuItemConstructorOptions, Tray } from 'electron';
import { ipcMain, Menu, nativeImage } from 'electron';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import statusStopped from './assets/status-stopped.png';
import type { AnimatedTray } from './tray-animate-icon.js';
import { TrayMenu } from './tray-menu.js';
import * as util from './util.js';

let trayMenu: TrayMenu;
let tray: Tray;
let animatedTray: AnimatedTray;
beforeAll(() => {
  tray = {
    setContextMenu: vi.fn(),
    on: vi.fn(),
    isDestroyed: vi.fn().mockReturnValue(false),
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

  onSpy.mock.calls[0]?.[1](undefined as unknown as Electron.IpcMainEvent, {
    providerId: 'testId',
    menuItem: { id: 'itemId', label: 'SomeLabel' },
  });

  trayMenu.deleteProviderItem('testId', 'itemId');
  expect(
    (menuBuild.mock.lastCall?.[0]?.[0]?.submenu as Array<MenuItemConstructorOptions>)?.filter(
      it => it.label === 'SomeLabel',
    ),
  ).toStrictEqual([]);
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

  onSpy.mock.calls[0]?.[1](undefined as unknown as Electron.IpcMainEvent, {
    providerId: 'testId',
    menuItem: { id: 'itemId', label: 'SomeLabel' },
  });

  trayMenu.addProviderItems({
    id: 'testId',
    name: 'TestProv',
    internalId: 'internalId',
  } as ProviderInfo);

  expect(
    (menuBuild.mock.lastCall?.[0]?.[0]?.submenu as Array<MenuItemConstructorOptions>)?.filter(
      it => it.label === 'SomeLabel',
    ),
  ).toBeDefined();
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
    lifecycleMethods: ['start'],
  } as ProviderInfo);

  const startItem = (menuBuild.mock.lastCall?.[0]?.[0]?.submenu as Array<MenuItemConstructorOptions>)?.find(
    it => it.label === 'Start',
  );
  expect(startItem).toBeDefined();
  expect(startItem?.enabled).toBeTruthy();
});

test('Tray provider start or stop should not be visible when provider has no lifecycle methods', () => {
  const menuBuild = vi.spyOn(Menu, 'buildFromTemplate');

  trayMenu = new TrayMenu(tray, animatedTray);

  trayMenu.addProviderItems({
    id: 'testId',
    name: 'TestProv',
    internalId: 'internalId',
    status: 'configured',
  } as ProviderInfo);

  const startItem = (menuBuild.mock.lastCall?.[0]?.[0]?.submenu as Array<MenuItemConstructorOptions>)?.find(
    it => it.label === 'Start',
  );
  expect(startItem).toBeUndefined();

  const stopItem = (menuBuild.mock.lastCall?.[0]?.[0]?.submenu as Array<MenuItemConstructorOptions>)?.find(
    it => it.label === 'Stop',
  );
  expect(stopItem).toBeUndefined();
});

test('Tray click trigger is only added on Windows devices', () => {
  const onSpy = vi.spyOn(tray, 'on');

  vi.spyOn(util, 'isWindows').mockReturnValue(true);
  trayMenu = new TrayMenu(tray, animatedTray);
  expect(onSpy).toHaveBeenCalledWith('click', expect.any(Function));
  onSpy.mockClear();

  vi.spyOn(util, 'isWindows').mockReturnValue(false);
  trayMenu = new TrayMenu(tray, animatedTray);
  expect(onSpy).not.toHaveBeenCalledWith('click', expect.any(Function));
});

test('with a provider already found, should push the addProviderMenuItem fine', async () => {
  const onSpy = vi.spyOn(ipcMain, 'on');
  const menuBuild = vi.spyOn(Menu, 'buildFromTemplate');

  trayMenu = new TrayMenu(tray, animatedTray);

  // Add a "provider" so that the menu already finds the provider
  trayMenu.addProviderItems({
    id: 'testId',
    name: 'TestProviderAlreadyHere',
    internalId: 'internalId',
  } as ProviderInfo);

  // Do a mock call which should add the menu item (testId matches the provider added above)
  onSpy.mock.calls[0]?.[1](undefined as unknown as Electron.IpcMainEvent, {
    providerId: 'testId',
    menuItem: { id: 'itemId', label: 'Foobar' },
  });

  // Expect that tray menu was called with TestProviderAlreadyHere
  // as well as the actual add-provider-menu-item event happened.
  expect(onSpy).toHaveBeenCalledWith('tray:add-provider-menu-item', expect.any(Function));
  expect(menuBuild).toHaveBeenCalled();
  expect(menuBuild.mock.lastCall?.[0]?.[0]?.label).toBe('TestProviderAlreadyHere');

  // Check that the menu item has been successfully added to the provider's menu
  expect(
    (menuBuild.mock.lastCall?.[0]?.[0]?.submenu as Array<MenuItemConstructorOptions>)?.filter(
      it => it.label === 'Foobar',
    ),
  ).toHaveLength(1);

  // Expect that we have "TestProv" somewhere in the menu (not submenu)
  const providerMenu = (menuBuild.mock.lastCall?.[0] as Array<MenuItemConstructorOptions>).find(
    it => it.label === 'TestProviderAlreadyHere',
  );
  expect(providerMenu).toBeDefined();
});

test('should call addProviderItems when provider not found but providerInfo is present', () => {
  const onSpy = vi.spyOn(ipcMain, 'on');
  const menuBuild = vi.spyOn(Menu, 'buildFromTemplate');

  trayMenu = new TrayMenu(tray, animatedTray);

  // The "test" providerInfo is used that "adds" the provider
  const providerInfo: ProviderInfo = {
    id: 'testId',
    name: 'TestProviderWasntHere',
    internalId: 'internalId',
  } as ProviderInfo;

  const param = {
    providerId: 'testId',
    menuItem: { id: 'itemId', label: 'Foobar' },
    providerInfo,
  };

  // Fire off the event
  onSpy.mock.calls[0]?.[1](undefined as unknown as Electron.IpcMainEvent, param);

  // Expect that menu has been called and the item is added to the corrent provider (TestProv)
  expect(onSpy).toHaveBeenCalledWith('tray:add-provider-menu-item', expect.any(Function));
  expect(menuBuild).toHaveBeenCalled();
  expect(
    (menuBuild.mock.lastCall?.[0]?.[0]?.submenu as Array<MenuItemConstructorOptions>)?.filter(
      it => it.label === 'Foobar',
    ),
  ).toHaveLength(1);

  // Expect that we have "TestProv" somewhere in the menu (not submenu)
  const providerMenu = (menuBuild.mock.lastCall?.[0] as Array<MenuItemConstructorOptions>).find(
    it => it.label === 'TestProviderWasntHere',
  );
  expect(providerMenu).toBeDefined();
});

test('should log error if provider not found and no providerInfo provided', () => {
  const onSpy = vi.spyOn(ipcMain, 'on');
  const consoleErrorSpy = vi.spyOn(console, 'error');

  trayMenu = new TrayMenu(tray, animatedTray);

  // Fire off the event without providerInfo and nothing in the provider array at all.
  onSpy.mock.calls[0]?.[1](undefined as unknown as Electron.IpcMainEvent, {
    providerId: 'testId',
    menuItem: { id: 'itemId', label: 'Foobar' },
  });

  // Expect that an error has been logged
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    'No provider registered for providerId "testId", please register a provider before adding a menu item to the tray.',
  );
});
