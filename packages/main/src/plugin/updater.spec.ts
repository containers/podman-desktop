/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import type { ClientRequest, IncomingMessage, RequestOptions } from 'node:http';
import { get } from 'node:https';

import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { Configuration } from '@desktop-framework/extension-api';
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
import { isLinux, isMac, isWindows } from '/@/util.js';
import product from '/@product.json' with { type: 'json' };

// eslint-disable-next-line no-restricted-imports
import type PackageJSON from '../../../../package.json';
import type { TaskManager } from './tasks/task-manager.js';

vi.mock(
  import('electron'),
  () =>
    ({
      app: {
        getVersion: vi.fn(),
        getPath: vi.fn(),
        getAppPath: vi.fn().mockReturnValue('a-custom-appPath'),
      },
      shell: {
        openExternal: vi.fn(),
      },
    }) as unknown as typeof Electron,
);

vi.mock(import('electron-updater'), () => ({
  autoUpdater: {
    downloadUpdate: vi.fn(),
    quitAndInstall: vi.fn(),
    checkForUpdates: vi.fn(),
    on: vi.fn(),
    setFeedURL: vi.fn(),
    autoDownload: true,
    disableDifferentialDownload: false,
  } as unknown as AppUpdater,
}));

vi.mock(import('/@/util.js'), () => ({
  isLinux: vi.fn(),
  isWindows: vi.fn(),
  isMac: vi.fn(),
}));

const getStatusCodeMock = { statusCode: 200 } as IncomingMessage;

vi.mock(import('node:https'));
vi.mock(import('../../../../package.json'), () => ({
  default: {
    homepage: 'appHomepage',
    repository: 'appRepo',
  } as unknown as typeof PackageJSON,
}));

vi.mock(import('/@product.json'));

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
  updateConfigurationValue: vi.fn(),
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

function mockConfiguration(options: Record<string, unknown>): void {
  vi.mocked(configurationMock.get).mockImplementation((section, defaultValue) => {
    if (section in options) {
      return options[section];
    }
    return defaultValue;
  });
}

/**
 * The {@link import(`node:https`).get} has two signature.
 * We need to make a weird function to be able to typesafely mock it
 */
function getMock(
  _: RequestOptions | string | URL,
  arg2: RequestOptions | ((res: IncomingMessage) => void),
  arg3?: (res: IncomingMessage) => void,
): ClientRequest {
  if (typeof arg2 === 'function') {
    arg2?.(getStatusCodeMock);
  } else if (typeof arg3 === 'function') {
    arg3?.(getStatusCodeMock);
  }
  return {} as unknown as ClientRequest;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetAllMocks();

  vi.mocked(get).mockImplementation(getMock);

  // Simulate PROD env
  vi.stubEnv('PROD', true);

  vi.mocked(app.getVersion).mockReturnValue('@debug');
  // eslint-disable-next-line no-null/no-null
  vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue(null);

  vi.mocked(product).name = 'Podman Desktop';
  vi.mocked(product).releaseNotes = {
    url: '',
    blog: '',
    title: '',
    summary: '',
    image: '',
  };

  vi.mocked(product).update = {
    url: '',
    updateChannel: '',
  };

  vi.mocked(commandRegistryMock.executeCommand).mockResolvedValue(undefined);
  vi.mocked(util.isLinux).mockReturnValue(false);

  mockConfiguration({
    'update.reminder': 'never',
  });
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

test('expect configuration description to use product name', () => {
  vi.mocked(product).name = 'Custom Product Name';

  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();

  expect(configurationRegistryMock.registerConfigurations).toHaveBeenCalled();
  const configurationNode = vi.mocked(configurationRegistryMock.registerConfigurations).mock.calls[0]?.[0]?.[0];
  expect(configurationNode?.id).toBe('preferences.update');
  expect(configurationNode?.properties?.['preferences.update.reminder']?.description).toBe(
    'Configure whether you receive update reminders when starting Custom Product Name',
  );
});

test('expect setFeedURL not to be called when product.update.url is empty', () => {
  vi.mocked(product).update = { url: '', updateChannel: '' };

  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();

  expect(autoUpdater.setFeedURL).not.toHaveBeenCalled();
});

test('expect setFeedURL to be called with generic provider when product.update.url is set', () => {
  vi.mocked(product).update = { url: 'https://updates.example.com/releases', updateChannel: '' };

  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();

  expect(autoUpdater.setFeedURL).toHaveBeenCalledWith({
    provider: 'generic',
    url: 'https://updates.example.com/releases',
  });
});

test('expect setFeedURL to be called before checkForUpdates', () => {
  vi.mocked(product).update = { url: 'https://updates.example.com/releases', updateChannel: '' };

  const callOrder: string[] = [];
  vi.mocked(autoUpdater.setFeedURL).mockImplementation(() => {
    callOrder.push('setFeedURL');
  });
  vi.mocked(autoUpdater.checkForUpdates).mockImplementation(() => {
    callOrder.push('checkForUpdates');
    // eslint-disable-next-line no-null/no-null
    return Promise.resolve(null);
  });

  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();

  expect(callOrder).toStrictEqual(['setFeedURL', 'checkForUpdates']);
});

test('expect channel not to be called when product.update.updateChannel is empty', () => {
  vi.mocked(product).update = { url: '', updateChannel: '' };

  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();

  expect(autoUpdater.channel).toBeUndefined();
});

test('expect channel to be called with generic provider when product.update.updateChannel is set', () => {
  vi.mocked(product).update = { url: '', updateChannel: 'next' };

  new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  ).init();

  expect(autoUpdater.channel).toBe('next');
});

describe('differential download', () => {
  type TestCase = {
    platform: 'windows' | 'macos';
    configuration: boolean;
    expectDifferentialDownload: 'enable' | 'disable';
  };

  beforeEach(() => {
    // default should be false
    autoUpdater.disableDifferentialDownload = false;

    // mock platform
    vi.mocked(isWindows).mockReturnValue(true);
    vi.mocked(isMac).mockReturnValue(false);
    vi.mocked(isLinux).mockReturnValue(false);

    const updater = new Updater(
      messageBoxMock,
      configurationRegistryMock,
      statusBarRegistryMock,
      commandRegistryMock,
      taskManagerMock,
      apiSenderMock,
    );
    updater.init();

    // Updater#init should set it to true
    expect(autoUpdater.disableDifferentialDownload).toBeTruthy();
  });

  test('default configuration should disable on windows', () => {
    // mock no user configuration
    mockConfiguration({});
  });

  test.each<TestCase>([
    {
      platform: 'windows',
      configuration: false,
      expectDifferentialDownload: 'enable',
    },
    {
      platform: 'windows',
      configuration: true,
      expectDifferentialDownload: 'disable',
    },
    {
      platform: 'macos',
      configuration: false,
      expectDifferentialDownload: 'enable',
    },
    {
      platform: 'macos',
      configuration: true,
      expectDifferentialDownload: 'disable',
    },
  ])(
    'expect differential download to be $expectDifferentialDownload on $platform with config $configuration',
    ({ platform, configuration, expectDifferentialDownload }) => {
      // mock platform
      vi.mocked(isMac).mockReturnValue(platform === 'macos');
      vi.mocked(isWindows).mockReturnValue(platform === 'windows');
      vi.mocked(isLinux).mockReturnValue(false);

      mockConfiguration({
        'update.disableDifferentialDownload': configuration,
      });

      const updater = new Updater(
        messageBoxMock,
        configurationRegistryMock,
        statusBarRegistryMock,
        commandRegistryMock,
        taskManagerMock,
        apiSenderMock,
      );
      updater.init();

      // Updater#init should set it to true
      expect(autoUpdater.disableDifferentialDownload).toBe(expectDifferentialDownload === 'disable');
    },
  );
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

test('expect default status entry when error due to missing app-update.yml', () => {
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

  // call the listener with a generic error (e.g. missing app-update.yml)
  mListener?.(new Error('ENOENT: no such file or directory, open app-update.yml'));

  expect(setEntryMock).toHaveBeenCalled();
});

test('expect command update to be called when configuration value on startup', () => {
  let mListener: (() => void) | undefined;
  vi.spyOn(autoUpdater, 'on').mockImplementation((channel: keyof AppUpdaterEvents, listener: unknown): AppUpdater => {
    if (channel === 'update-available') mListener = listener as () => void;
    return {} as unknown as AppUpdater;
  });

  mockConfiguration({
    'update.reminder': 'startup',
  });

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

  mockConfiguration({
    'update.reminder': 'never',
  });

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

type StartupUpdateListener = (context?: 'startup' | 'status-bar-entry') => Promise<void>;

const initUpdaterAndGetUpdateListener = (): StartupUpdateListener => {
  let mListener: StartupUpdateListener | undefined;
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

  if (mListener === undefined) throw new Error('mListener undefined');
  return mListener;
};

test('clicking on "Later" then "Don\'t show again" should set the configuration value to never', async () => {
  vi.mocked(messageBoxMock.showMessageBox).mockResolvedValue({
    response: 'Later',
    dropdownIndex: 1,
  });

  const mListener = initUpdaterAndGetUpdateListener();

  await mListener('startup');

  expect(configurationMock.update).toHaveBeenCalledWith('update.reminder', 'never');
});

test('clicking on "Later" then "Remind me later" should only dismiss the dialog', async () => {
  vi.mocked(messageBoxMock.showMessageBox).mockResolvedValue({
    response: 'Later',
    dropdownIndex: 0,
  });

  const mListener = initUpdaterAndGetUpdateListener();

  await mListener('startup');

  expect(configurationMock.update).not.toHaveBeenCalled();
  expect(taskManagerMock.createTask).not.toHaveBeenCalled();
  expect(autoUpdater.downloadUpdate).not.toHaveBeenCalled();
  expect(shell.openExternal).not.toHaveBeenCalled();
});

describe('expect update command to depends on context', async () => {
  type UpdateCommandListener = (context: 'startup' | 'status-bar-entry') => Promise<void>;
  const getUpdateListener = async (): Promise<UpdateCommandListener> => {
    vi.mocked(messageBoxMock.showMessageBox).mockResolvedValue({
      response: 'Cancel',
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
      cancelId: undefined,
      buttons: [
        'Update now',
        `What's new`,
        { type: 'dropdownButton', heading: 'Later', buttons: ['Remind me later', `Don't show again`] },
      ],
      message:
        'A new version v@debug-next of Podman Desktop is available. Do you want to update your current version v@debug?',
      title: 'Update Podman Desktop?',
      type: 'info',
    });
  });

  test('startup context, clicking "Update now" should start the download', async () => {
    const mListener = await getUpdateListener();

    vi.mocked(messageBoxMock.showMessageBox).mockResolvedValueOnce({
      response: 'Update now',
    });

    await mListener?.('startup');

    expect(taskManagerMock.createTask).toHaveBeenCalled();
    expect(autoUpdater.downloadUpdate).toHaveBeenCalled();
  });

  test(`startup context, clicking "What's new" should open release notes`, async () => {
    const mListener = await getUpdateListener();

    vi.mocked(messageBoxMock.showMessageBox).mockResolvedValueOnce({
      response: `What's new`,
    });
    vi.mocked(shell.openExternal).mockResolvedValue();

    await mListener?.('startup');

    expect(shell.openExternal).toHaveBeenCalled();
  });

  test('status-bar-entry context', async () => {
    const mListener = await getUpdateListener();

    // Call the `update` command listener
    await mListener?.('status-bar-entry');

    expect(messageBoxMock.showMessageBox).toHaveBeenCalledWith({
      cancelId: 2,
      buttons: ['Update now', `What's new`, 'Cancel'],
      message:
        'A new version v@debug-next of Podman Desktop is available. Do you want to update your current version v@debug?',
      title: 'Update Podman Desktop?',
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
      response: 'Update now',
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
      response: 'Restart',
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
      response: 'Update now',
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
  await updater.openReleaseNotes('v0.1.1');
  expect(shell.openExternal).toBeCalledWith('appHomepage/blog/podman-desktop-release-0.1');
  await updater.openReleaseNotes('0.2.1');
  expect(shell.openExternal).toBeCalledWith('appHomepage/blog/podman-desktop-release-0.2');
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
  await updater.openReleaseNotes('v1.1.1');
  expect(shell.openExternal).toBeCalledWith('appRepo/releases/tag/v1.1.1');
  await updater.openReleaseNotes('1.1.2');
  expect(shell.openExternal).toBeCalledWith('appRepo/releases/tag/v1.1.2');

  getStatusCodeMock.statusCode = 200;
});

test('get release notes', async () => {
  const fetchJSONMock = vi.fn().mockResolvedValue({ data: 'some data' });
  vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: fetchJSONMock } as unknown as Response);
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

test('open release notes with product override', async () => {
  vi.mocked(product).releaseNotes.url = 'http://product-notes.com';
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
  expect(shell.openExternal).toBeCalledWith('http://product-notes.com');
});

test('get release notes with product override', async () => {
  vi.mocked(product).releaseNotes.url = 'http://product-notes.com';
  vi.mocked(product).releaseNotes.blog = 'product-blog';
  vi.mocked(product).releaseNotes.title = 'product-title';
  vi.mocked(product).releaseNotes.summary = 'product-summary';
  vi.mocked(product).releaseNotes.image = 'product-image';

  const updater = new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  );

  updater.init();
  const releaseNotes = await updater.getReleaseNotes();
  expect(releaseNotes).toStrictEqual({
    releaseNotesAvailable: true,
    notesURL: 'http://product-notes.com',
    notes: {
      image: 'product-image',
      blog: 'product-blog',
      title: 'product-title',
      summary: 'product-summary',
    },
  });
});

test('get release notes in dev mode', async () => {
  const fetchJSONMock = vi.fn().mockResolvedValue({ data: 'some data' });
  vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: fetchJSONMock } as unknown as Response);
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

test.each([
  { nextVersion: '1.5.1', currentVersion: '1.5.0', expected: true },
  { nextVersion: '1.5.0', currentVersion: '1.5.0', expected: false },
  { nextVersion: '1.5.0', currentVersion: '1.5.1', expected: false },
  { nextVersion: '', currentVersion: '1.5.1', expected: false },
])(
  'update availability: next $nextVersion vs current $currentVersion',
  async ({ nextVersion, currentVersion, expected }) => {
    vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({
      updateInfo: {
        version: nextVersion,
      },
    } as unknown as UpdateCheckResult);

    vi.mocked(app.getVersion).mockReturnValue(currentVersion);

    const updater = new Updater(
      messageBoxMock,
      configurationRegistryMock,
      statusBarRegistryMock,
      commandRegistryMock,
      taskManagerMock,
      apiSenderMock,
    );
    updater.init();

    await vi.waitFor(() => expect(autoUpdater.checkForUpdates).toBeCalled());
    expect(updater.updateAvailable()).toBe(expected);
  },
);

test('update version is not full semver', async () => {
  vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({
    updateInfo: {
      version: '1.5',
    },
  } as unknown as UpdateCheckResult);

  vi.mocked(app.getVersion).mockReturnValue('1.4.1');
  const updater = new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  );
  updater.init();

  await vi.waitFor(() => expect(autoUpdater.checkForUpdates).toBeCalled());

  expect(updater.updateAvailable()).toBeTruthy();
});

test('versions are not numbered versions', async () => {
  vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({
    updateInfo: {
      version: 'foo',
    },
  } as unknown as UpdateCheckResult);

  vi.mocked(app.getVersion).mockReturnValue('bar');
  const updater = new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  );
  updater.init();

  await vi.waitFor(() => expect(autoUpdater.checkForUpdates).toBeCalled());

  expect(updater.updateAvailable()).toBeTruthy();
});

test('clicking View Release Notes in version command should show release notes', async () => {
  vi.mocked(messageBoxMock.showMessageBox).mockResolvedValue({
    response: 'View Release Notes',
  });

  vi.mocked(configurationRegistryMock.updateConfigurationValue).mockResolvedValue(undefined);

  let versionListener: (() => Promise<void>) | undefined;
  vi.mocked(commandRegistryMock.registerCommand).mockImplementation(
    (channel: string, listener: () => Promise<void>) => {
      if (channel === 'version') versionListener = listener;
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
  expect(versionListener).toBeDefined();

  await versionListener?.();

  expect(configurationRegistryMock.updateConfigurationValue).toHaveBeenCalledWith('releaseNotesBanner.show', 'show');
  expect(apiSenderMock.send).toHaveBeenCalledWith('show-release-notes');
});

test(`clicking What's new in update command should open release notes`, async () => {
  vi.mocked(messageBoxMock.showMessageBox).mockResolvedValue({
    response: `What's new`,
  });

  vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({
    updateInfo: {
      version: '2.0.0',
    },
  } as unknown as UpdateCheckResult);

  type UpdateCommandListener = (context?: 'startup' | 'status-bar-entry') => Promise<void>;
  let updateListener: UpdateCommandListener | undefined;
  vi.mocked(commandRegistryMock.registerCommand).mockImplementation(
    (channel: string, listener: () => Promise<void>) => {
      if (channel === 'update') updateListener = listener;
      return Disposable.noop();
    },
  );

  vi.mocked(shell.openExternal).mockResolvedValue();

  const updater = new Updater(
    messageBoxMock,
    configurationRegistryMock,
    statusBarRegistryMock,
    commandRegistryMock,
    taskManagerMock,
    apiSenderMock,
  );
  updater.init();

  await vi.waitUntil(() => updater.updateAvailable(), { interval: 500, timeout: 2000 });

  expect(updateListener).toBeDefined();
  await updateListener?.('status-bar-entry');

  expect(shell.openExternal).toHaveBeenCalled();
});

describe('appUpdate configuration', () => {
  test('init should skip update setup when appUpdate is disabled', () => {
    mockConfiguration({ 'update.appUpdate': false, 'update.reminder': 'never' });

    const updater = new Updater(
      messageBoxMock,
      configurationRegistryMock,
      statusBarRegistryMock,
      commandRegistryMock,
      taskManagerMock,
      apiSenderMock,
    );
    updater.init();

    expect(autoUpdater.on).not.toHaveBeenCalled();
    expect(autoUpdater.checkForUpdates).not.toHaveBeenCalled();
    expect(statusBarRegistryMock.setEntry).toHaveBeenCalled();

    const registeredCommands = vi.mocked(commandRegistryMock.registerCommand).mock.calls.map(call => call[0]);
    expect(registeredCommands).toContain('version');
    expect(registeredCommands).not.toContain('update');
  });

  test('init should proceed with update setup when appUpdate is true', () => {
    mockConfiguration({ 'update.appUpdate': true, 'update.reminder': 'never' });

    const updater = new Updater(
      messageBoxMock,
      configurationRegistryMock,
      statusBarRegistryMock,
      commandRegistryMock,
      taskManagerMock,
      apiSenderMock,
    );
    updater.init();

    expect(autoUpdater.on).toHaveBeenCalled();
    expect(autoUpdater.checkForUpdates).toHaveBeenCalled();
  });

  test('updateAvailable should return false when appUpdate is disabled', () => {
    mockConfiguration({ 'update.appUpdate': false, 'update.reminder': 'never' });

    const updater = new Updater(
      messageBoxMock,
      configurationRegistryMock,
      statusBarRegistryMock,
      commandRegistryMock,
      taskManagerMock,
      apiSenderMock,
    );
    updater.init();

    expect(updater.updateAvailable()).toBe(false);
  });

  test('registerConfiguration should include preferences.update.appUpdate', () => {
    const updater = new Updater(
      messageBoxMock,
      configurationRegistryMock,
      statusBarRegistryMock,
      commandRegistryMock,
      taskManagerMock,
      apiSenderMock,
    );
    updater.init();

    expect(configurationRegistryMock.registerConfigurations).toHaveBeenCalled();
    const configurations = vi.mocked(configurationRegistryMock.registerConfigurations).mock.calls[0]![0]!;
    const properties = configurations.flatMap(config => Object.keys(config.properties ?? {}));
    expect(properties).toContain('preferences.update.appUpdate');
  });
});
