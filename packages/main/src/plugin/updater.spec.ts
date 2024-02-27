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
import type { MessageBox } from '/@/plugin/message-box.js';
import type { StatusBarRegistry } from '/@/plugin/statusbar/statusbar-registry.js';
import type { CommandRegistry } from '/@/plugin/command-registry.js';
import { Disposable } from '/@/plugin/types/disposable.js';
import { UPDATER_UPDATE_AVAILABLE_ICON } from '/@/plugin/index.js';
import { Updater } from '/@/plugin/updater.js';

const mocks = vi.hoisted(() => ({
  // MessageBoxMock
  showMessageBoxMock: vi.fn(),
  // StatusBarRegistry
  setEntryMock: vi.fn(),
  // CommandRegistry
  registerCommandMock: vi.fn(),
  executeCommandMock: vi.fn(),
  // Electron App
  getVersionMock: vi.fn(),
  // Electron Update
  downloadUpdateMock: vi.fn(),
  quitAndInstallMock: vi.fn(),
  checkForUpdatesMock: vi.fn(),
  onMock: vi.fn(),
  // utils
  isLinuxMock: vi.fn(),
}));

vi.mock('electron', () => ({
  app: {
    getVersion: mocks.getVersionMock,
  },
}));

vi.mock('electron-updater', () => ({
  autoUpdater: {
    downloadUpdate: mocks.downloadUpdateMock,
    quitAndInstall: mocks.quitAndInstallMock,
    checkForUpdates: mocks.checkForUpdatesMock,
    on: mocks.onMock,
    autoDownload: true,
  },
}));

vi.mock('/@/util.js', () => ({
  isLinux: mocks.isLinuxMock,
}));

const messageBoxMock = {
  showMessageBox: mocks.showMessageBoxMock,
} as unknown as MessageBox;

const statusBarRegistryMock = {
  setEntry: mocks.setEntryMock,
} as unknown as StatusBarRegistry;

const commandRegistry = {
  registerCommand: mocks.registerCommandMock,
  executeCommand: mocks.executeCommandMock,
} as unknown as CommandRegistry;

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetAllMocks();

  // Simulate PROD env
  vi.stubEnv('PROD', 'true');

  mocks.getVersionMock.mockReturnValue('@debug');
  mocks.checkForUpdatesMock.mockResolvedValue(undefined);
  mocks.executeCommandMock.mockResolvedValue(undefined);
  mocks.isLinuxMock.mockReturnValue(false);
});

test('expect env PROD to be truthy', () => {
  expect(import.meta.env.PROD).toBeTruthy();
});

test('expect init to provide a disposable', () => {
  const updater = new Updater(messageBoxMock, statusBarRegistryMock, commandRegistry);
  const disposable: unknown = updater.init();
  expect(disposable).toBeDefined();
  expect(disposable instanceof Disposable).toBe(true);
});

test('expect init to register commands', () => {
  new Updater(messageBoxMock, statusBarRegistryMock, commandRegistry).init();

  expect(mocks.registerCommandMock).toHaveBeenCalled();
});

test('expect update available entry to be displayed when expected', () => {
  mocks.setEntryMock.mockImplementation(
    (entryId, _alignLeft, _priority, text, tooltip, iconClass, enabled, command, _commandArgs, highlight) => {
      expect(entryId).toBe('version');
      expect(text).toBe('v@debug');
      expect(tooltip).toBe('Update available');
      expect(iconClass).toBe(UPDATER_UPDATE_AVAILABLE_ICON);
      expect(enabled).toBe(true);
      expect(command).toBe('update');
      expect(highlight).toBe(true);
    },
  );

  let mListener: (() => void) | undefined;
  mocks.onMock.mockImplementation((channel: string, listener: () => void) => {
    if (channel === 'update-available') mListener = listener;
  });

  new Updater(messageBoxMock, statusBarRegistryMock, commandRegistry).init();

  // listener should exist
  expect(mListener).toBeDefined();

  // call the listener (which should be the private updateAvailableEntry method)
  mListener?.();

  expect(mocks.setEntryMock).toHaveBeenCalled();
});

test('expect default status entry to be displayed when no update available', () => {
  mocks.setEntryMock.mockImplementation(
    (entryId, _alignLeft, _priority, text, tooltip, iconClass, enabled, command, _commandArgs, highlight) => {
      expect(entryId).toBe('version');
      expect(text).toBe('v@debug');
      expect(tooltip).toBe('Using version v@debug');
      expect(iconClass).toBe(undefined);
      expect(enabled).toBe(true);
      expect(command).toBe('version');
      expect(highlight).toBeFalsy();
    },
  );

  let mListener: (() => void) | undefined;
  mocks.onMock.mockImplementation((channel: string, listener: () => void) => {
    if (channel === 'update-not-available') mListener = listener;
  });

  new Updater(messageBoxMock, statusBarRegistryMock, commandRegistry).init();

  // listener should exist
  expect(mListener).toBeDefined();

  // call the listener (which should be the private onUpdateNotAvailable method)
  mListener?.();

  expect(mocks.setEntryMock).toHaveBeenCalled();
});
