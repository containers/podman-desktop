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

import type { Configuration } from '@podman-desktop/api';
import { app } from 'electron';
import { type AppUpdater, autoUpdater, type UpdateCheckResult } from 'electron-updater';
import type { AppUpdaterEvents } from 'electron-updater/out/AppUpdater.js';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { CommandRegistry } from '/@/plugin/command-registry.js';
import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { UPDATER_UPDATE_AVAILABLE_ICON } from '/@/plugin/index.js';
import type { MessageBox } from '/@/plugin/message-box.js';
import type { StatusBarRegistry } from '/@/plugin/statusbar/statusbar-registry.js';
import { Disposable } from '/@/plugin/types/disposable.js';
import { Updater } from '/@/plugin/updater.js';
import * as util from '/@/util.js';

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

const configurationMock = {
  get: vi.fn(),
  has: vi.fn(),
  update: vi.fn(),
} as unknown as Configuration;

const configurationRegistryMock = {
  registerConfigurations: vi.fn(),
  getConfiguration: vi.fn(),
} as unknown as ConfigurationRegistry;

const statusBarRegistryMock = {
  setEntry: vi.fn(),
} as unknown as StatusBarRegistry;

const commandRegistryMock = {
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

  vi.mocked(commandRegistryMock.executeCommand).mockResolvedValue(undefined);
  vi.mocked(util.isLinux).mockReturnValue(false);

  vi.mocked(configurationMock.get).mockReturnValue('never');
  vi.mocked(configurationMock.update).mockResolvedValue(undefined);
  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue(configurationMock);
});

test('expect env PROD to be truthy', () => {
  expect(import.meta.env.PROD).toBeTruthy();
});

test('expect init to provide a disposable', () => {
  const updater = new Updater(messageBoxMock, configurationRegistryMock, statusBarRegistryMock, commandRegistryMock);
  const disposable: unknown = updater.init();
  expect(disposable).toBeDefined();
  expect(disposable instanceof Disposable).toBeTruthy();
});

test('expect init to register commands', () => {
  new Updater(messageBoxMock, configurationRegistryMock, statusBarRegistryMock, commandRegistryMock).init();
  expect(commandRegistryMock.registerCommand).toHaveBeenCalled();
});

test('expect init to register configuration', () => {
  new Updater(messageBoxMock, configurationRegistryMock, statusBarRegistryMock, commandRegistryMock).init();
  expect(configurationRegistryMock.registerConfigurations).toHaveBeenCalled();
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

  new Updater(messageBoxMock, configurationRegistryMock, statusBarRegistryMock, commandRegistryMock).init();

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

  new Updater(messageBoxMock, configurationRegistryMock, statusBarRegistryMock, commandRegistryMock).init();

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

  new Updater(messageBoxMock, configurationRegistryMock, statusBarRegistryMock, commandRegistryMock).init();

  // listener should exist
  expect(mListener).toBeDefined();

  // call the listener (which should be the private onUpdateNotAvailable method)
  mListener?.(new Error('No published versions on GitHub'));

  expect(setEntryMock).toHaveBeenCalled();
});

test('expect command update to be called when configuration value on startup', () => {
  let mListener: (() => void) | undefined;
  vi.spyOn(autoUpdater, 'on').mockImplementation((channel: keyof AppUpdaterEvents, listener: unknown): AppUpdater => {
    if (channel === 'update-available') mListener = listener as () => void;
    return {} as unknown as AppUpdater;
  });

  vi.mocked(configurationMock.get).mockReturnValue('startup');

  new Updater(messageBoxMock, configurationRegistryMock, statusBarRegistryMock, commandRegistryMock).init();

  // call the listener (which should be the private updateAvailableEntry method)
  mListener?.();

  expect(configurationRegistryMock.getConfiguration).toHaveBeenCalled();
  expect(commandRegistryMock.executeCommand).toHaveBeenCalledWith('update', 'startup');
});

test('expect command update not to be called when configuration value on never', () => {
  let mListener: (() => void) | undefined;
  vi.spyOn(autoUpdater, 'on').mockImplementation((channel: keyof AppUpdaterEvents, listener: unknown): AppUpdater => {
    if (channel === 'update-available') mListener = listener as () => void;
    return {} as unknown as AppUpdater;
  });

  vi.mocked(configurationMock.get).mockReturnValue('never');

  new Updater(messageBoxMock, configurationRegistryMock, statusBarRegistryMock, commandRegistryMock).init();

  // call the listener (which should be the private updateAvailableEntry method)
  mListener?.();

  expect(configurationRegistryMock.getConfiguration).toHaveBeenCalled();
  expect(commandRegistryMock.executeCommand).not.toHaveBeenCalled();
});

test('clicking on "Update Never" should set the configuration value to never', async () => {
  vi.mocked(messageBoxMock.showMessageBox).mockResolvedValue({
    response: 2, // Update never
  });

  let mListener: (() => Promise<void>) | undefined;
  vi.mocked(commandRegistryMock.registerCommand).mockImplementation(
    (channel: string, listener: () => Promise<void>) => {
      if (channel === 'update') mListener = listener;
      return Disposable.noop();
    },
  );

  new Updater(messageBoxMock, configurationRegistryMock, statusBarRegistryMock, commandRegistryMock).init();
  expect(mListener).toBeDefined();

  await mListener?.();

  expect(configurationMock.update).toHaveBeenCalledWith('update.reminder', 'never');
});

describe('expect update command to depends on context', async () => {
  type UpdateCommandListener = (context: 'startup' | 'status-bar-entry') => Promise<void>;
  const getUpdateListener = async (): Promise<UpdateCommandListener> => {
    vi.mocked(messageBoxMock.showMessageBox).mockResolvedValue({
      response: 2, // Update never
    });

    vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({
      updateInfo: {
        version: '@debug-next',
      },
    } as unknown as UpdateCheckResult);

    let mListener: UpdateCommandListener | undefined;
    vi.mocked(commandRegistryMock.registerCommand).mockImplementation(
      (channel: string, listener: () => Promise<void>) => {
        if (channel === 'update') mListener = listener;
        return Disposable.noop();
      },
    );

    const updater = new Updater(messageBoxMock, configurationRegistryMock, statusBarRegistryMock, commandRegistryMock);
    updater.init();

    if (mListener === undefined) throw new Error('mListener undefined');

    // We have to wait for the autoUpdater.checkForUpdates to have been properly processed
    await vi.waitUntil(
      () => {
        return updater.updateAvailable();
      },
      {
        interval: 500,
        timeout: 2000,
      },
    );

    return mListener;
  };

  test('startup context', async () => {
    const mListener = await getUpdateListener();

    // Call the `update` command listener
    await mListener?.('startup');

    expect(messageBoxMock.showMessageBox).toHaveBeenCalledWith({
      cancelId: 1,
      buttons: ['Update now', 'Remind me later', 'Do not show again'],
      message:
        'A new version v@debug-next of Podman Desktop is available. Do you want to update your current version v@debug?',
      title: 'Update Available now',
      type: 'info',
    });
  });

  test('startup context', async () => {
    const mListener = await getUpdateListener();

    // Call the `update` command listener
    await mListener?.('status-bar-entry');

    expect(messageBoxMock.showMessageBox).toHaveBeenCalledWith({
      cancelId: 1,
      buttons: ['Update now', 'Cancel'],
      message:
        'A new version v@debug-next of Podman Desktop is available. Do you want to update your current version v@debug?',
      title: 'Update Available now',
      type: 'info',
    });
  });
});
