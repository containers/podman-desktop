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

import { rm } from 'node:fs/promises';
import * as path from 'node:path';

import type { ExtensionInfo } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { CatalogFetchableExtension } from '@desktop-framework/api/extension-catalog';
import type { IpcMain, IpcMainEvent } from 'electron';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ContributionManager } from '/@/plugin/contribution-manager.js';
import type { Directories } from '/@/plugin/directories.js';
import type { ExtensionsCatalog } from '/@/plugin/extension/catalog/extensions-catalog.js';
import type { AnalyzedExtension } from '/@/plugin/extension/extension-analyzer.js';
import type { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';
import type { ImageRegistry } from '/@/plugin/image-registry.js';
import type { MessageBox } from '/@/plugin/message-box.js';
import type { TaskManager } from '/@/plugin/tasks/task-manager.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';

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
const ensureExtensionsMock = vi.fn();
const extensionLoader: ExtensionLoader = {
  getPluginsDirectory: getPluginsDirectoryMock,
  listExtensions: listExtensionsMock,
  loadExtension: loadExtensionMock,
  loadExtensions: loadExtensionsMock,
  analyzeExtension: analyzeExtensionMock,
  ensureExtensionIsEnabled: ensureExtensionsMock,
  markOverridingExtensions: vi.fn(),
  replaceBundledExtension: vi.fn(),
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

const telemetryMock = {
  track: vi.fn(),
} as unknown as Telemetry;

const directories = {
  getPluginsDirectory: vi.fn(),
  getContributionStorageDir: vi.fn(),
} as unknown as Directories;

const contributionManager = {} as unknown as ContributionManager;
const ipcMainOnMock = vi.fn();

const createTaskMock = vi.fn();
const taskManager = {
  createTask: createTaskMock,
} as unknown as TaskManager;

const messageBox = {
  showMessageBox: vi.fn(),
} as unknown as MessageBox;

vi.mock(import('node:fs'));
vi.mock(import('node:fs/promises'));
vi.mock(import('/@/plugin/docker-extension/docker-desktop-installer.js'));

beforeEach(() => {
  vi.resetAllMocks();

  createTaskMock.mockReturnValue({
    status: 'in-progress',
    progress: undefined,
    error: undefined,
  });

  vi.mocked(rm).mockResolvedValue(undefined);
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
    ipcMainOnMock,
    taskManager,
    messageBox,
  );
});

describe('installFromImage task lifecycle', () => {
  const imageToPull = 'fake.io/fake-image:fake-tag';

  test('should create a task with the image name on success', async () => {
    getImageConfigLabelsMock.mockResolvedValueOnce({
      'org.opencontainers.image.title': 'title',
      'org.opencontainers.image.description': 'desc',
      'org.opencontainers.image.vendor': 'vendor',
      'io.podman-desktop.api.version': '1.0.0',
    });
    listExtensionsMock.mockResolvedValueOnce([]);
    vi.spyOn(extensionInstaller, 'extractExtensionFiles').mockResolvedValueOnce();
    analyzeExtensionMock.mockResolvedValueOnce({ manifest: {} } as AnalyzedExtension);

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull);

    expect(createTaskMock).toHaveBeenCalledWith({ title: `Installing extension ${imageToPull}` });
    const task = createTaskMock.mock.results[0]?.value;
    expect(task.status).toBe('success');
  });

  test('should update task.progress during image download', async () => {
    getImageConfigLabelsMock.mockResolvedValueOnce({
      'org.opencontainers.image.title': 'title',
      'org.opencontainers.image.description': 'desc',
      'org.opencontainers.image.vendor': 'vendor',
      'io.podman-desktop.api.version': '1.0.0',
    });
    listExtensionsMock.mockResolvedValueOnce([]);
    vi.spyOn(extensionInstaller, 'extractExtensionFiles').mockResolvedValueOnce();
    analyzeExtensionMock.mockResolvedValueOnce({ manifest: {} } as AnalyzedExtension);

    downloadAndExtractImageMock.mockImplementation(
      async (_image: string, _dest: string, logger: (event: { message: string; progress: number }) => void) => {
        logger({ message: 'Downloading layer 1/2', progress: 50 });
        logger({ message: 'Downloading layer 2/2', progress: 100 });
      },
    );

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull);

    const task = createTaskMock.mock.results[0]?.value;
    expect(task.progress).toBe(100);
  });

  test('should mark task as failed when installation errors', async () => {
    getImageConfigLabelsMock.mockRejectedValueOnce(new Error('network failure'));

    await extensionInstaller.installFromImage(vi.fn(), vi.fn(), vi.fn(), imageToPull);

    expect(createTaskMock).toHaveBeenCalledWith({ title: `Installing extension ${imageToPull}` });
    const task = createTaskMock.mock.results[0]?.value;
    expect(task.error).toBe('Error while analyzing image: Error: network failure');
  });
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

  expect(ensureExtensionsMock).toHaveBeenCalled();

  expect(sendLog).toHaveBeenCalledWith(`Analyzing image ${imageToPull}...`);
  // expect no error
  expect(sendError).not.toHaveBeenCalled();

  expect(sendEnd).toHaveBeenCalledWith('Extension Successfully installed.');

  // extension started
  expect(apiSenderSendMock).toHaveBeenCalledWith('extension-started');
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

test('should fail if extension with same id is already installed', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();
  const imageToPull = 'fake.io/new-image:tag';

  // Mock valid labels
  vi.mocked(imageRegistry.getImageConfigLabels).mockResolvedValueOnce({
    'org.opencontainers.image.title': 'fake-title',
    'org.opencontainers.image.description': 'fake-description',
    'org.opencontainers.image.vendor': 'fake-vendor',
    'io.podman-desktop.api.version': '1.0.0',
  });

  // Mock existing extension with collision
  const publisher = 'my-publisher';
  const name = 'my-extension';

  const id = `${publisher}.${name}`;
  listExtensionsMock.mockResolvedValue([
    {
      id,
      name: name,
      path: '/some/existing/path',
    },
  ]);

  analyzeExtensionMock.mockResolvedValueOnce({
    id,
  } as AnalyzedExtension);

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  expect(sendLog).toHaveBeenCalledWith(`Analyzing image ${imageToPull}...`);

  // expect error
  expect(sendError).toHaveBeenCalledWith(`Extension ${publisher}.${name} is already installed.`);

  expect(sendEnd).not.toBeCalled();
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

test('should remove the extension folders when the dependencies analysis reports errors', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';
  const extension = { path: '/fake/extension/path', manifest: { name: 'my-extension' } } as AnalyzedExtension;

  vi.spyOn(extensionInstaller, 'analyzeFromImage').mockResolvedValueOnce(extension);
  vi.spyOn(extensionInstaller, 'analyzeTransitiveDependencies').mockImplementationOnce(
    async (_extension, analyzedExtensions, errors) => {
      analyzedExtensions.push(extension);
      errors.push('fake dependency error');
      return true;
    },
  );

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  expect(rm).toHaveBeenCalledWith('/fake/extension/path', { recursive: true, force: true });
  expect(sendError).toHaveBeenCalledWith(`Error while installing extension ${imageToPull}: fake dependency error`);
  expect(sendEnd).not.toHaveBeenCalled();
});

test('should not continue when removing the extension folders fails', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';
  const extension = { path: '/fake/extension/path', manifest: { name: 'my-extension' } } as AnalyzedExtension;

  vi.spyOn(extensionInstaller, 'analyzeFromImage').mockResolvedValueOnce(extension);
  vi.spyOn(extensionInstaller, 'analyzeTransitiveDependencies').mockImplementationOnce(
    async (_extension, analyzedExtensions, errors) => {
      analyzedExtensions.push(extension);
      errors.push('fake dependency error');
      return true;
    },
  );
  vi.mocked(rm).mockRejectedValueOnce(new Error('EACCES'));

  await expect(extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull)).rejects.toThrow('EACCES');

  expect(sendError).not.toHaveBeenCalled();
  expect(sendEnd).not.toHaveBeenCalled();
});

test('should report error', async () => {
  const imageToPull = 'fake.io/fake-image:fake-tag';

  const spyExtractExtensionFiles = vi.spyOn(extensionInstaller, 'extractExtensionFiles');
  spyExtractExtensionFiles.mockResolvedValueOnce();

  const replyMethodMock = vi.fn();

  const spyInstaller = vi.spyOn(extensionInstaller, 'installFromImage');
  spyInstaller.mockRejectedValueOnce(new Error('fake error'));

  vi.mocked(ipcMainOnMock).mockImplementation(
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
  expect(apiSenderSendMock).toHaveBeenCalledWith('extension-started');

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
  expect(apiSenderSendMock).toHaveBeenCalledWith('extension-started');

  // should have been called to load two extensions (current + extension pack)
  // expect to have 2 arguments in array
  expect(loadExtensionsMock).toHaveBeenCalledWith(expect.arrayContaining([extensionA, extensionB, extensionC]));
});

test('should install an image with extension pack with an existing dependency already installed', async () => {
  const sendLog = vi.fn();
  const sendError = vi.fn();
  const sendEnd = vi.fn();

  const imageToPull = 'fake.io/fake-image:fake-tag';
  const analyzeFromImageSpy = vi.spyOn(extensionInstaller, 'analyzeFromImage');

  const extensionWithPack = {
    manifest: {
      name: 'extension-with-pack',
      extensionPack: ['my.another-extension', 'my.other-extension'],
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

  // my.another-extension is already installed
  const extensionInfo = {
    id: 'my.another-extension',
  } as unknown as ExtensionInfo;
  listExtensionsMock.mockResolvedValue([extensionInfo]);

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
  expect(apiSenderSendMock).toHaveBeenCalledWith('extension-started');

  // should have been called to load two extensions (current + extension pack)
  // expect to have 2 arguments in array
  expect(loadExtensionsMock).toHaveBeenCalledWith(expect.arrayContaining([extensionWithPack, extensionOther]));

  expect(analyzeFromImageSpy).toHaveBeenCalledWith(
    expect.any(Function),
    expect.any(Function),
    'my-other-extension-link',
  );

  // this extension is already installed, so we should not analyze it
  expect(analyzeFromImageSpy).not.toHaveBeenCalledWith(
    expect.any(Function),
    expect.any(Function),
    'my-another-extension-link',
  );
});

/**
 * Build an extension analyzed from an image, the given fields taking precedence.
 */
function buildAnalyzedExtension(id: string, fields: Partial<AnalyzedExtension> = {}): AnalyzedExtension {
  const name = id.substring(id.indexOf('.') + 1);
  return {
    id,
    name,
    path: `/fake/plugins/directory/${name}`,
    manifest: { name, displayName: name, version: '1.0.0', publisher: 'podman-desktop', description: name },
    readme: '',
    removable: true,
    devMode: false,
    bundled: false,
    subscriptions: [],
    dispose: (): void => {},
    ...fields,
  };
}

/**
 * Build an installed extension, the given fields taking precedence.
 */
function buildExtensionInfo(id: string, fields: Partial<ExtensionInfo> = {}): ExtensionInfo {
  const name = id.substring(id.indexOf('.') + 1);
  return {
    id,
    name,
    description: name,
    displayName: name,
    publisher: 'podman-desktop',
    removable: true,
    devMode: false,
    bundled: false,
    version: '1.0.0',
    state: 'started',
    path: `/fake/plugins/directory/${name}`,
    readme: '',
    ...fields,
  };
}

describe('installing an extension replacing a bundled one', () => {
  const imageToPull = 'fake.io/kind:1.99.0';
  let sendLog: (message: string) => void;
  let sendError: (message: string) => void;
  let sendEnd: (message: string) => void;
  let installedExtension: AnalyzedExtension;

  beforeEach(() => {
    sendLog = vi.fn();
    sendError = vi.fn();
    sendEnd = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    getImageConfigLabelsMock.mockResolvedValue({
      'org.opencontainers.image.title': 'kind',
      'org.opencontainers.image.description': 'Kind',
      'org.opencontainers.image.vendor': 'podman-desktop',
      'io.podman-desktop.api.version': '1.0.0',
    });
    vi.spyOn(extensionInstaller, 'extractExtensionFiles').mockResolvedValue();

    installedExtension = buildAnalyzedExtension('podman-desktop.kind');
    analyzeExtensionMock.mockResolvedValue(installedExtension);
    // the bundled kind extension is loaded
    listExtensionsMock.mockResolvedValue([
      buildExtensionInfo('podman-desktop.kind', { displayName: 'Kind', removable: false, bundled: true }),
    ]);
    // the loader flags the extension as replacing the bundled one having the same id
    vi.mocked(extensionLoader.markOverridingExtensions).mockImplementation(candidates => {
      for (const candidate of candidates) {
        candidate.overrides = { id: candidate.id, version: '1.31.0-next' };
      }
    });
  });

  test('replaces the bundled extension after confirmation', async () => {
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Replace' });

    await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

    expect(messageBox.showMessageBox).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Replace Extension?',
        message: `This extension is replacing your existing extension named 'Kind'.`,
      }),
    );
    expect(extensionLoader.replaceBundledExtension).toHaveBeenCalledWith('podman-desktop.kind');
    expect(loadExtensionsMock).toHaveBeenCalledWith([installedExtension]);
    expect(sendError).not.toHaveBeenCalled();
    expect(sendEnd).toHaveBeenCalledWith('Extension Successfully installed.');
  });

  test('removes the extracted files when the user cancels', async () => {
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Cancel' });

    await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

    expect(rm).toHaveBeenCalledWith(installedExtension.path, { recursive: true, force: true });
    expect(sendError).toHaveBeenCalledWith(`Installation of ${imageToPull} cancelled.`);
    expect(extensionLoader.replaceBundledExtension).not.toHaveBeenCalled();
    expect(loadExtensionsMock).not.toHaveBeenCalled();
  });

  test('removes the extracted files when the confirmation cannot be asked', async () => {
    const error = new Error('no renderer');
    vi.mocked(messageBox.showMessageBox).mockRejectedValue(error);

    await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

    expect(vi.mocked(console.error)).toHaveBeenCalledWith('Error while asking to replace a bundled extension', error);
    expect(rm).toHaveBeenCalledWith(installedExtension.path, { recursive: true, force: true });
    expect(sendError).toHaveBeenCalledWith(`Installation of ${imageToPull} cancelled.`);
    expect(loadExtensionsMock).not.toHaveBeenCalled();
  });

  test('does not ask for confirmation when installing an update', async () => {
    await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull, undefined, undefined, {
      confirm: false,
    });

    expect(messageBox.showMessageBox).not.toHaveBeenCalled();
    expect(extensionLoader.replaceBundledExtension).toHaveBeenCalledWith('podman-desktop.kind');
    expect(loadExtensionsMock).toHaveBeenCalledWith([installedExtension]);
  });

  test('does not ask for confirmation when the bundled extension is not loaded', async () => {
    // e.g. the extension replacing it has been removed to be updated
    listExtensionsMock.mockResolvedValue([]);

    await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

    expect(messageBox.showMessageBox).not.toHaveBeenCalled();
    expect(loadExtensionsMock).toHaveBeenCalledWith([installedExtension]);
    expect(installedExtension.overrides).toEqual({ id: 'podman-desktop.kind', version: '1.31.0-next' });
  });

  test('still refuses an extension having the id of an installed extension which is not bundled', async () => {
    listExtensionsMock.mockResolvedValue([buildExtensionInfo('podman-desktop.kind')]);

    await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

    expect(sendError).toHaveBeenCalledWith('Extension podman-desktop.kind is already installed.');
    expect(extensionLoader.markOverridingExtensions).not.toHaveBeenCalled();
    expect(loadExtensionsMock).not.toHaveBeenCalled();
  });
});
