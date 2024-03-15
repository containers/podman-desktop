/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { rmSync } from 'node:fs';
import * as path from 'node:path';

import type { IpcMain, IpcMainEvent } from 'electron';
import { ipcMain } from 'electron';
import { beforeEach, expect, test, vi } from 'vitest';

import type { ApiSenderType } from '../api.js';
import type { ContributionManager } from '../contribution-manager.js';
import type { Directories } from '../directories.js';
import type { AnalyzedExtension, ExtensionLoader } from '../extension-loader.js';
import type { ExtensionsCatalog } from '../extensions-catalog/extensions-catalog.js';
import type { CatalogFetchableExtension } from '../extensions-catalog/extensions-catalog-api.js';
import type { ImageRegistry } from '../image-registry.js';
import type { Telemetry } from '../telemetry/telemetry.js';
import { ExtensionInstaller } from './extension-installer.js';

let extensionInstaller: ExtensionInstaller;

const apiSenderSendMock = vi.fn();
const apiSender: ApiSenderType = {
  send: apiSenderSendMock,
} as unknown as ApiSenderType;

const getPluginsDirectoryMock = vi.fn();
getPluginsDirectoryMock.mockReturnValue('/fake/plugins/directory');

const listExtensionsMock = vi.fn();
const loadExtensionMock = vi.fn();
const analyzeExtensionMock = vi.fn();
const loadExtensionsMock = vi.fn();
const extensionLoader: ExtensionLoader = {
  getPluginsDirectory: getPluginsDirectoryMock,
  listExtensions: listExtensionsMock,
  loadExtension: loadExtensionMock,
  loadExtensions: loadExtensionsMock,
  analyzeExtension: analyzeExtensionMock,
} as unknown as ExtensionLoader;

const getImageConfigLabelsMock = vi.fn();
const downloadAndExtractImageMock = vi.fn();
const imageRegistry: ImageRegistry = {
  getImageConfigLabels: getImageConfigLabelsMock,
  downloadAndExtractImage: downloadAndExtractImageMock,
} as unknown as ImageRegistry;

const getFetchableExtensionsMock = vi.fn();
const extensionsCatalog = {
  getFetchableExtensions: getFetchableExtensionsMock,
} as unknown as ExtensionsCatalog;

vi.mock('electron', () => {
  const mockIpcMain = {
    on: vi.fn().mockReturnThis(),
  };
  return { ipcMain: mockIpcMain };
});

const telemetryMock = {
  track: vi.fn(),
} as unknown as Telemetry;

const directories = {
  getPluginsDirectory: vi.fn(),
  getContributionStorageDir: vi.fn(),
} as unknown as Directories;

const contributionManager = {} as unknown as ContributionManager;

vi.mock('node:fs');

vi.mock('./../docker-extension/docker-desktop-installer', async () => {
  const ddInstallerReal = await vi.importActual('../docker-extension/docker-desktop-installer');

  return {
    DockerDesktopInstaller: vi.fn().mockImplementation(() => {
      return {
        extractExtensionFiles: vi.fn(),
        setupContribution: vi.fn(),
      };
    }),
    DockerDesktopContribution: ddInstallerReal.DockerDesktopContribution,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(rmSync).mockReturnValue(undefined);
  vi.mocked(directories.getPluginsDirectory).mockReturnValue('/fake/plugins/directory');
  vi.mocked(directories.getContributionStorageDir).mockReturnValue('/fake/dd/directory');
  extensionInstaller = new ExtensionInstaller(
    apiSender,
    extensionLoader,
    imageRegistry,
    extensionsCatalog,
    telemetryMock,
    directories,
    contributionManager,
  );
});

test('should install an image if labels are correct', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';

  getImageConfigLabelsMock.mockResolvedValueOnce({
    'org.opencontainers.image.title': 'fake-title',
    'org.opencontainers.image.description': 'fake-description',
    'org.opencontainers.image.vendor': 'fake-vendor',
    'io.podman-desktop.api.version': '1.0.0',
  });

  listExtensionsMock.mockResolvedValueOnce([]);

  const spyExtractExtensionFiles = vi.spyOn(extensionInstaller, 'extractExtensionFiles');
  spyExtractExtensionFiles.mockResolvedValueOnce();

  analyzeExtensionMock.mockResolvedValueOnce({
    manifest: {},
  } as AnalyzedExtension);

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  expect(sendLog).toHaveBeenCalledWith(`Analyzing image ${imageToPull}...`);
  // expect no error
  expect(sendError).not.toHaveBeenCalled();

  expect(sendEnd).toHaveBeenCalledWith('Extension Successfully installed.');

  // extension started
  expect(apiSenderSendMock).toHaveBeenCalledWith('extension-started', {});
});

test('should install an image (dd extensions) if labels are correct', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';

  vi.mocked(imageRegistry.getImageConfigLabels).mockResolvedValueOnce({
    'org.opencontainers.image.title': 'fake-title',
    'org.opencontainers.image.description': 'fake-description',
    'org.opencontainers.image.vendor': 'fake-vendor',
    'com.docker.desktop.extension.api.version': '1.0.0',
  });

  const spyExtractExtensionFiles = vi.spyOn(extensionInstaller, 'extractExtensionFiles');

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  expect(sendLog).toHaveBeenCalledWith(`Analyzing image ${imageToPull}...`);
  // expect no error
  expect(sendError).not.toHaveBeenCalled();

  expect(spyExtractExtensionFiles).not.toHaveBeenCalled();
});

test('should fail if extension is already installed', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';

  getImageConfigLabelsMock.mockResolvedValueOnce({
    'org.opencontainers.image.title': 'fake-title',
    'org.opencontainers.image.description': 'fake-description',
    'org.opencontainers.image.vendor': 'fake-vendor',
    'io.podman-desktop.api.version': '1.0.0',
  });

  const extensionName = 'fake extension';
  listExtensionsMock.mockResolvedValueOnce([
    {
      name: 'fake extension',
      path: path.join('/fake/plugins/directory', 'fakeiofakeimage'),
    },
  ]);

  const spyExtractExtensionFiles = vi.spyOn(extensionInstaller, 'extractExtensionFiles');
  spyExtractExtensionFiles.mockResolvedValueOnce();

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  expect(sendLog).toHaveBeenCalledWith(`Analyzing image ${imageToPull}...`);

  // expect error
  expect(sendError).toHaveBeenCalledWith(`Extension ${extensionName} is already installed`);

  expect(sendEnd).not.toBeCalled();

  // extension not started
  expect(apiSenderSendMock).not.toBeCalled();
});

test('should fail if an image have incorrect labels', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';

  // no labels to make invalid image
  getImageConfigLabelsMock.mockResolvedValueOnce({});

  listExtensionsMock.mockResolvedValueOnce([]);

  const spyExtractExtensionFiles = vi.spyOn(extensionInstaller, 'extractExtensionFiles');
  spyExtractExtensionFiles.mockResolvedValueOnce();

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  expect(sendLog).toHaveBeenCalledWith(`Analyzing image ${imageToPull}...`);
  // expect error
  expect(sendError).toHaveBeenCalledWith(`Image ${imageToPull} is not a Podman Desktop Extension`);

  expect(sendEnd).not.toBeCalled();

  // extension not started
  expect(apiSenderSendMock).not.toBeCalled();
});

test('should report error', async () => {
  const imageToPull = 'fake.io/fake-image:fake-tag';

  const spyExtractExtensionFiles = vi.spyOn(extensionInstaller, 'extractExtensionFiles');
  spyExtractExtensionFiles.mockResolvedValueOnce();

  const ipcMainOnMethod = vi.spyOn(ipcMain, 'on');

  const replyMethodMock = vi.fn();

  const spyInstaller = vi.spyOn(extensionInstaller, 'installFromImage');
  spyInstaller.mockRejectedValueOnce(new Error('fake error'));

  ipcMainOnMethod.mockImplementation(
    (_channel: string, listener: (event: IpcMainEvent, ...args: unknown[]) => void) => {
      // let's call the callback
      listener({ reply: replyMethodMock } as unknown as IpcMainEvent, imageToPull, 0);
      return {} as IpcMain;
    },
  );

  // call init method
  await extensionInstaller.init();

  // wait calls on reply mock with a loop
  while (replyMethodMock.mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // expect to have the sendError method called
  expect(replyMethodMock).toHaveBeenCalledWith('extension-installer:install-from-image-error', 0, 'Error: fake error');
});

test('should install an image with extension pack', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';
  const analyzeFromImageSpy = vi.spyOn(extensionInstaller, 'analyzeFromImage');

  const extensionWithPack = {
    manifest: {
      name: 'extension-with-pack',
      extensionPack: ['my.other-extension', 'my.another-extension'],
    },
  } as AnalyzedExtension;

  const extensionOther = {
    manifest: {
      name: 'other-extension',
    },
  } as AnalyzedExtension;

  const extensionAnother = {
    manifest: {
      name: 'another-extension',
    },
  } as AnalyzedExtension;

  analyzeFromImageSpy.mockImplementation(
    (_sendLog: (message: string) => void, _sendError: (message: string) => void, imageName: string) => {
      if (imageName === 'fake.io/fake-image:fake-tag') {
        return Promise.resolve(extensionWithPack);
      } else if (imageName === 'my-other-extension-link') {
        return Promise.resolve(extensionOther);
      } else {
        return Promise.resolve(extensionAnother);
      }
    },
  );

  // no installed extension
  listExtensionsMock.mockResolvedValue([]);

  const fetchableExtension1: CatalogFetchableExtension = {
    extensionId: 'my.other-extension',
    link: 'my-other-extension-link',
    version: 'latest',
  };
  const fetchableExtension2: CatalogFetchableExtension = {
    extensionId: 'my.another-extension',
    link: 'my-another-extension-link',
    version: 'latest',
  };

  getFetchableExtensionsMock.mockResolvedValue([fetchableExtension1, fetchableExtension2]);

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  // expect no error
  expect(sendError).not.toHaveBeenCalled();

  expect(sendEnd).toHaveBeenCalledWith('Extension Successfully installed.');

  // extension started
  expect(apiSenderSendMock).toHaveBeenCalledWith('extension-started', {});

  // should have been called to load two extensions (current + extension pack)
  // expect to have 2 arguments in array
  expect(loadExtensionsMock).toHaveBeenCalledWith(
    expect.arrayContaining([extensionWithPack, extensionOther, extensionAnother]),
  );
});

test('should install an image with transitive dependencies', async () => {
  // extension A depends on extension B
  // extension B depends on extension C
  // extension C depends on nothing

  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/extensionA';
  const analyzeFromImageSpy = vi.spyOn(extensionInstaller, 'analyzeFromImage');

  const extensionA = {
    manifest: {
      name: 'extension-a',
      extensionDependencies: ['my.extension-b'],
    },
  } as AnalyzedExtension;

  const extensionB = {
    manifest: {
      name: 'extension-b',
      extensionDependencies: ['my.extension-c'],
    },
  } as AnalyzedExtension;

  const extensionC = {
    manifest: {
      name: 'extension-c',
    },
  } as AnalyzedExtension;

  analyzeFromImageSpy.mockImplementation(
    (_sendLog: (message: string) => void, _sendError: (message: string) => void, imageName: string) => {
      if (imageName === 'fake.io/extensionA') {
        return Promise.resolve(extensionA);
      } else if (imageName === 'fake.io/extensionB') {
        return Promise.resolve(extensionB);
      } else if (imageName === 'fake.io/extensionC') {
        return Promise.resolve(extensionC);
      }
      return Promise.reject(new Error(`Unknown image name ${imageName}`));
    },
  );

  // no installed extension
  listExtensionsMock.mockResolvedValue([]);

  const fetchableExtensionB: CatalogFetchableExtension = {
    extensionId: 'my.extension-b',
    link: 'fake.io/extensionB',
    version: 'latest',
  };
  const fetchableExtensionC: CatalogFetchableExtension = {
    extensionId: 'my.extension-c',
    link: 'fake.io/extensionC',
    version: 'latest',
  };

  getFetchableExtensionsMock.mockResolvedValue([fetchableExtensionB, fetchableExtensionC]);

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  // expect no error
  expect(sendError).not.toHaveBeenCalled();

  expect(sendEnd).toHaveBeenCalledWith('Extension Successfully installed.');

  // extension started
  expect(apiSenderSendMock).toHaveBeenCalledWith('extension-started', {});

  // should have been called to load two extensions (current + extension pack)
  // expect to have 2 arguments in array
  expect(loadExtensionsMock).toHaveBeenCalledWith(expect.arrayContaining([extensionA, extensionB, extensionC]));
});
