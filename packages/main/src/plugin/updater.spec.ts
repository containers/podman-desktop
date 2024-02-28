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
import { app } from 'electron';
import { type AppUpdater, autoUpdater } from 'electron-updater';
import * as util from '/@/util.js';
import type { AppUpdaterEvents } from 'electron-updater/out/AppUpdater.js';

vi.mock('electron', () => ({
  app: {
    getVersion: vi.fn(),
  },
}));

vi.mock('electron-updater', () => ({
  autoUpdater: {
    downloadUpdate: vi.fn(),
    quitAndInstall: vi.fn(),
    checkForUpdates: vi.fn(),
    on: vi.fn(),
    autoDownload: true,
  },
}));

vi.mock('/@/util.js', () => ({
  isLinux: vi.fn(),
}));

const messageBoxMock = {
  showMessageBox: vi.fn(),
} as unknown as MessageBox;

const statusBarRegistryMock = {
  setEntry: vi.fn(),
} as unknown as StatusBarRegistry;

const commandRegistry = {
  registerCommand: vi.fn(),
  executeCommand: vi.fn(),
} as unknown as CommandRegistry;

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetAllMocks();

  // Simulate PROD env
  vi.stubEnv('PROD', 'true');

  vi.mocked(app.getVersion).mockReturnValue('@debug');
  // eslint-disable-next-line no-null/no-null
  vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue(null);

  vi.mocked(commandRegistry.executeCommand).mockResolvedValue(undefined);
  vi.mocked(util.isLinux).mockReturnValue(false);
});

test('expect env PROD to be truthy', () => {
  expect(import.meta.env.PROD).toBeTruthy();
});

test('expect init to provide a disposable', () => {
  const updater = new Updater(messageBoxMock, statusBarRegistryMock, commandRegistry);
  const disposable: unknown = updater.init();
  expect(disposable).toBeDefined();
  expect(disposable instanceof Disposable).toBeTruthy();
});

test('expect init to register commands', () => {
  new Updater(messageBoxMock, statusBarRegistryMock, commandRegistry).init();
  expect(commandRegistry.registerCommand).toHaveBeenCalled();
});

test('expect update available entry to be displayed when expected', () => {
  const setEntryMock = vi.spyOn(statusBarRegistryMock, 'setEntry');
  setEntryMock.mockImplementation(
    (entryId, _alignLeft, _priority, text, tooltip, iconClass, enabled, command, _commandArgs, highlight) => {
      expect(entryId).toBe('version');
      expect(text).toBe('v@debug');
      expect(tooltip).toBe('Update available');
      expect(iconClass).toBe(UPDATER_UPDATE_AVAILABLE_ICON);
      expect(enabled).toBeTruthy();
      expect(command).toBe('update');
      expect(highlight).toBeTruthy();
    },
  );

  let mListener: (() => void) | undefined;
  vi.spyOn(autoUpdater, 'on').mockImplementation((channel: keyof AppUpdaterEvents, listener: unknown): AppUpdater => {
    if (channel === 'update-available') mListener = listener as () => void;
    return {} as unknown as AppUpdater;
  });

  new Updater(messageBoxMock, statusBarRegistryMock, commandRegistry).init();

  // listener should exist
  expect(mListener).toBeDefined();

  // call the listener (which should be the private updateAvailableEntry method)
  mListener?.();

  expect(setEntryMock).toHaveBeenCalled();
});

test('expect default status entry to be displayed when no update available', () => {
  const setEntryMock = vi.spyOn(statusBarRegistryMock, 'setEntry');
  setEntryMock.mockImplementation(
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
  vi.spyOn(autoUpdater, 'on').mockImplementation((channel: keyof AppUpdaterEvents, listener: unknown): AppUpdater => {
    if (channel === 'update-not-available') mListener = listener as () => void;
    return {} as unknown as AppUpdater;
  });

  new Updater(messageBoxMock, statusBarRegistryMock, commandRegistry).init();

  // listener should exist
  expect(mListener).toBeDefined();

  // call the listener (which should be the private onUpdateNotAvailable method)
  mListener?.();

  expect(setEntryMock).toHaveBeenCalled();
});

test('expect default status entry when error No published versions on GitHub', () => {
  const setEntryMock = vi.spyOn(statusBarRegistryMock, 'setEntry');
  setEntryMock.mockImplementation(
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

  let mListener: ((error: Error) => void) | undefined;
  vi.spyOn(autoUpdater, 'on').mockImplementation((channel: keyof AppUpdaterEvents, listener: unknown): AppUpdater => {
    if (channel === 'error') mListener = listener as () => void;
    return {} as unknown as AppUpdater;
  });

  new Updater(messageBoxMock, statusBarRegistryMock, commandRegistry).init();

  // listener should exist
  expect(mListener).toBeDefined();

  // call the listener (which should be the private onUpdateNotAvailable method)
  mListener?.(new Error('No published versions on GitHub'));

  expect(setEntryMock).toHaveBeenCalled();
});
