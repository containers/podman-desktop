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

import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { ExtensionInstaller } from './extension-installer.js';
import type { ApiSenderType } from '../api.js';
import type { ExtensionLoader } from '../extension-loader.js';
import type { ImageRegistry } from '../image-registry.js';
import * as path from 'node:path';

let extensionInstaller: ExtensionInstaller;

const apiSenderSendMock = vi.fn();
const apiSender: ApiSenderType = {
  send: apiSenderSendMock,
} as unknown as ApiSenderType;

const getPluginsDirectoryMock = vi.fn();
getPluginsDirectoryMock.mockReturnValue('/fake/plugins/directory');

const listExtensionsMock = vi.fn();
const loadExtensionMock = vi.fn();
const extensionLoader: ExtensionLoader = {
  getPluginsDirectory: getPluginsDirectoryMock,
  listExtensions: listExtensionsMock,
  loadExtension: loadExtensionMock,
} as unknown as ExtensionLoader;

const getImageConfigLabelsMock = vi.fn();
const downloadAndExtractImageMock = vi.fn();
const imageRegistry: ImageRegistry = {
  getImageConfigLabels: getImageConfigLabelsMock,
  downloadAndExtractImage: downloadAndExtractImageMock,
} as unknown as ImageRegistry;

beforeAll(async () => {
  extensionInstaller = new ExtensionInstaller(apiSender, extensionLoader, imageRegistry);
});

beforeEach(() => {
  vi.clearAllMocks();
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

  await extensionInstaller.installFromImage(sendLog, sendError, sendEnd, imageToPull);

  expect(sendLog).toHaveBeenCalledWith(`Analyzing image ${imageToPull}...`);
  // expect no error
  expect(sendError).not.toHaveBeenCalled();

  expect(sendEnd).toHaveBeenCalledWith('Extension Successfully installed.');

  // extension started
  expect(apiSenderSendMock).toHaveBeenCalledWith('extension-started', {});
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
