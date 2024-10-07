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

import type { IncomingMessage } from 'node:http';

import type { Configuration } from '@podman-desktop/api';
import { app, shell } from 'electron';
import { type AppUpdater, autoUpdater, type UpdateCheckResult, type UpdateDownloadedEvent } from 'electron-updater';
import type { AppUpdaterEvents } from 'electron-updater/out/AppUpdater.js';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { CommandRegistry } from '/@/plugin/command-registry.js';
import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { UPDATER_UPDATE_AVAILABLE_ICON } from '/@/plugin/index.js';
import type { MessageBox } from '/@/plugin/message-box.js';
import type { StatusBarRegistry } from '/@/plugin/statusbar/statusbar-registry.js';
import type { Task } from '/@/plugin/tasks/tasks.js';
import { Disposable } from '/@/plugin/types/disposable.js';
import { Updater } from '/@/plugin/updater.js';
import * as util from '/@/util.js';

import type { ApiSenderType } from './api.js';
import type { TaskManager } from './tasks/task-manager.js';

vi.mock('electron', () => ({
  app: {
    getVersion: vi.fn(),
  },
  shell: {
    openExternal: vi.fn(),
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

const getStatusCodeMock = { statusCode: 200 } as IncomingMessage;

vi.mock('https', () => ({
  get: (_: string, callback: (_: IncomingMessage) => void): void => {
    callback(getStatusCodeMock);
  },
}));

vi.mock('../../../../package.json', () => ({
  homepage: 'appHomepage',
  repository: 'appRepo',
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

const taskManagerMock = {
  createTask: vi.fn(),
  updateTask: vi.fn(),
} as unknown as TaskManager;

const apiSenderMock = {
  send: vi.fn(),
} as unknown as ApiSenderType;

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetAllMocks();

  // Simulate PROD env
  vi.stubEnv('PROD', true);

  vi.mocked(app.getVersion).mockReturnValue('@debug');
  // eslint-disable-next-line no-null/no-null
  vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue(null);

  vi.mocked(commandRegistryMock.executeCommand).mockResolvedValue(undefined);
  vi.mocked(util.isLinux).mockReturnValue(false);

  vi.mocked(configurationMock.get).mockReturnValue('never');
  vi.mocked(configurationMock.update).mockResolvedValue(undefined);
  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue(configurationMock);

  vi.mocked(taskManagerMock.createTask).mockResolvedValue({
    progress: 0,
  } as unknown as Task);
  console.error = vi.fn();
});

test('expect env PROD to be truthy', () => {
  expect(import.meta.env.PROD).toBeTruthy();
});

test('expect init to provide a disposable', () => {
  const updater = new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  );
  const disposable: unknown = updater.init();
  expect(disposable).toBeDefined();
  expect(disposable instanceof Disposable).toBeTruthy();
});

test('expect init to register commands', () => {
  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();
  expect(commandRegistryMock.registerCommand).toHaveBeenCalled();
});

test('expect init to register configuration', () => {
  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();
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

  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();

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

  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();

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

  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();

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

  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();

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

  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();

  // call the listener (which should be the private updateAvailableEntry method)
  mListener?.();

  expect(configurationRegistryMock.getConfiguration).toHaveBeenCalled();
  expect(commandRegistryMock.executeCommand).not.toHaveBeenCalled();
});

test('clicking on "Update Never" should set the configuration value to never', async () => {
  vi.mocked(messageBoxMock.showMessageBox).mockResolvedValue({
    response: 3, // Update never
  });

  let mListener: (() => Promise<void>) | undefined;
  vi.mocked(commandRegistryMock.registerCommand).mockImplementation(
    (channel: string, listener: () => Promise<void>) => {
      if (channel === 'update') mListener = listener;
      return Disposable.noop();
    },
  );

  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();
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

    const updater = new Updater(
      messageBoxMock,
      configurationRegistryMock,
      statusBarRegistryMock,
      commandRegistryMock,
      taskManagerMock,
      apiSenderMock,
    );
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
      cancelId: 2,
      buttons: ['Update now', 'View release notes', 'Remind me later', 'Do not show again'],
      message:
        'A new version v@debug-next of Podman Desktop is available. Do you want to update your current version v@debug?',
      title: 'Update Available now',
      type: 'info',
    });
  });

  test('status-bar-entry context', async () => {
    const mListener = await getUpdateListener();

    // Call the `update` command listener
    await mListener?.('status-bar-entry');

    expect(messageBoxMock.showMessageBox).toHaveBeenCalledWith({
      cancelId: 2,
      buttons: ['Update now', 'View release notes', 'Cancel'],
      message:
        'A new version v@debug-next of Podman Desktop is available. Do you want to update your current version v@debug?',
      title: 'Update Available now',
      type: 'info',
    });
  });
});

describe('download task and progress', async () => {
  test('success', async () => {
    type UpdateCommandCallback = (context: 'startup' | 'status-bar-entry') => Promise<void>;

    vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({
      updateInfo: {
        version: '0.5.0',
      },
    } as unknown as UpdateCheckResult);

    // catch the update command listener
    let updateCommandCallback: UpdateCommandCallback | undefined;
    vi.mocked(commandRegistryMock.registerCommand).mockImplementation(
      (channel: string, callback: () => Promise<void>) => {
        if (channel === 'update') {
          updateCommandCallback = callback;
        }
        return Disposable.noop();
      },
    );

    let onUpdateDownloadedCallback: ((updatedDownloadedEvent: UpdateDownloadedEvent) => void) | undefined;
    let downloadProgressCallback: ((info: { percent: number }) => void) | undefined;
    vi.spyOn(autoUpdater, 'on').mockImplementation((channel: keyof AppUpdaterEvents, listener: unknown): AppUpdater => {
      if (channel === 'update-downloaded') {
        onUpdateDownloadedCallback = listener as () => void;
      } else if (channel === 'download-progress') {
        downloadProgressCallback = listener as (info: { percent: number }) => void;
      }
      return {} as unknown as AppUpdater;
    });

    new Updater(
      messageBoxMock,
      configurationRegistryMock,
      statusBarRegistryMock,
      commandRegistryMock,
      taskManagerMock,
      apiSenderMock,
    ).init();

    // callbacks should exist
    expect(updateCommandCallback).toBeDefined();
    expect(onUpdateDownloadedCallback).toBeDefined();
    expect(downloadProgressCallback).toBeDefined();

    // call the update command callback
    vi.mocked(messageBoxMock.showMessageBox).mockResolvedValueOnce({
      response: 0,
    });

    await updateCommandCallback?.('status-bar-entry');

    // expect a task has been created (and updated)
    expect(taskManagerMock.createTask).toHaveBeenCalled();

    expect(autoUpdater.downloadUpdate).toHaveBeenCalled();

    // now call the progress with 50%
    downloadProgressCallback?.({ percent: 50 });

    // now call the onUpdateDownloadedCallback
    const updatedDownloadedEvent = {
      downloadedFile: 'foo',
      version: 'FooVersion',
    } as unknown as UpdateDownloadedEvent;

    // user click on restart
    vi.mocked(messageBoxMock.showMessageBox).mockResolvedValueOnce({
      response: 0,
    });

    onUpdateDownloadedCallback?.(updatedDownloadedEvent);
  });

  test('failure', async () => {
    type UpdateCommandCallback = (context: 'startup' | 'status-bar-entry') => Promise<void>;

    vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({
      updateInfo: {
        version: '0.5.0',
      },
    } as unknown as UpdateCheckResult);

    // catch the update command listener
    let updateCommandCallback: UpdateCommandCallback | undefined;
    vi.mocked(commandRegistryMock.registerCommand).mockImplementation(
      (channel: string, callback: () => Promise<void>) => {
        if (channel === 'update') {
          updateCommandCallback = callback;
        }
        return Disposable.noop();
      },
    );

    let downloadProgressCallback: ((info: { percent: number }) => void) | undefined;
    vi.spyOn(autoUpdater, 'on').mockImplementation((channel: keyof AppUpdaterEvents, listener: unknown): AppUpdater => {
      if (channel === 'download-progress') {
        downloadProgressCallback = listener as (info: { percent: number }) => void;
      }
      return {} as unknown as AppUpdater;
    });

    new Updater(
      messageBoxMock,
      configurationRegistryMock,
      statusBarRegistryMock,
      commandRegistryMock,
      taskManagerMock,
      apiSenderMock,
    ).init();

    // call the update command callback
    vi.mocked(messageBoxMock.showMessageBox).mockResolvedValueOnce({
      response: 0,
    });

    // simulate download failure
    vi.mocked(autoUpdater.downloadUpdate).mockRejectedValueOnce(new Error('Download failed'));

    await updateCommandCallback?.('status-bar-entry');

    // expect a task has been created (and updated)
    expect(taskManagerMock.createTask).toHaveBeenCalled();

    expect(autoUpdater.downloadUpdate).toHaveBeenCalled();

    // now call the progress with 50%
    downloadProgressCallback?.({ percent: 50 });
  });
});

test('open release notes from podman-desktop.io', async () => {
  vi.mocked(app.getVersion).mockReturnValue('1.1.0');
  vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({
    updateInfo: {
      version: '1.2.0',
    },
  } as unknown as UpdateCheckResult);

  const updater = new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  );

  vi.mocked(shell.openExternal).mockResolvedValue();
  updater.init();

  await updater.openReleaseNotes('current');
  expect(shell.openExternal).toBeCalledWith('appHomepage/blog/podman-desktop-release-1.1');
  await updater.openReleaseNotes('latest');
  expect(shell.openExternal).toBeCalledWith('appHomepage/blog/podman-desktop-release-1.2');
});

test('open release notes from GitHub', async () => {
  vi.mocked(app.getVersion).mockReturnValue('0.20.0');
  vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({
    updateInfo: {
      version: '0.21.0',
    },
  } as unknown as UpdateCheckResult);

  getStatusCodeMock.statusCode = 404;

  const updater = new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  );
  vi.mocked(shell.openExternal).mockResolvedValue();
  updater.init();

  await updater.openReleaseNotes('current');
  expect(shell.openExternal).toBeCalledWith('appRepo/releases/tag/v0.20.0');
  await updater.openReleaseNotes('latest');
  expect(shell.openExternal).toBeCalledWith('appRepo/releases/tag/v0.21.0');
});

test('get release notes', async () => {
  const fetchJSONMock = vi.fn().mockResolvedValue({ data: 'some data' });
  vi.spyOn(global, 'fetch').mockImplementation(() =>
    Promise.resolve({ ok: true, json: fetchJSONMock } as unknown as Response),
  );
  vi.mocked(app.getVersion).mockReturnValue('1.1.0');

  const updater = new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  );

  updater.init();
  let releaseNotes = await updater.getReleaseNotes();
  expect(fetch).toBeCalledWith('appHomepage/release-notes/1.1.json');
  expect(releaseNotes).toStrictEqual({
    releaseNotesAvailable: true,
    notesURL: 'appHomepage/blog/podman-desktop-release-1.1',
    notes: { data: 'some data' },
  });

  vi.spyOn(global, 'fetch')
    .mockResolvedValueOnce({ ok: false, json: fetchJSONMock.mockResolvedValue({}) } as unknown as Response)
    .mockResolvedValueOnce({ ok: true, json: fetchJSONMock.mockResolvedValue({}) } as unknown as Response);

  releaseNotes = await updater.getReleaseNotes();
  expect(releaseNotes).toStrictEqual({ releaseNotesAvailable: false, notesURL: `appRepo/releases/tag/v1.1.0` });

  vi.spyOn(global, 'fetch')
    .mockResolvedValueOnce({ ok: false, json: fetchJSONMock.mockResolvedValue({}) } as unknown as Response)
    .mockResolvedValueOnce({ ok: false, json: fetchJSONMock.mockResolvedValue({}) } as unknown as Response);

  releaseNotes = await updater.getReleaseNotes();
  expect(releaseNotes).toStrictEqual({ releaseNotesAvailable: false, notesURL: '' });
});

test('get release notes in dev mode', async () => {
  const fetchJSONMock = vi.fn().mockResolvedValue({ data: 'some data' });
  vi.spyOn(global, 'fetch').mockImplementation(() =>
    Promise.resolve({ ok: true, json: fetchJSONMock } as unknown as Response),
  );
  vi.mocked(app.getVersion).mockReturnValue('1.1.0-next');

  // use dev mode
  vi.stubEnv('DEV', true);
  try {
    const updater = new Updater(
      messageBoxMock,
      configurationRegistryMock,
      statusBarRegistryMock,
      commandRegistryMock,
      taskManagerMock,
      apiSenderMock,
    );

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: fetchJSONMock.mockResolvedValue({ tag_name: 'v123' }),
    } as unknown as Response);
    /*.mockResolvedValueOnce({ ok: true, json: fetchJSONMock.mockResolvedValue({}) } as unknown as Response);*/

    await updater.getReleaseNotes();
    // check we tried to get latest release from github
    expect(fetch).toBeCalledWith('https://api.github.com/repos/containers/podman-desktop/releases/latest');

    // check we tried to get release notes from the 123 release
    expect(fetch).toBeCalledWith('appHomepage/release-notes/123.json');
  } finally {
    vi.unstubAllEnvs();
  }
});
