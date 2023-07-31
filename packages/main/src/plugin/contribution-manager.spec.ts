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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { beforeAll, beforeEach, expect, test, vi } from 'vitest';
import type { ApiSenderType } from './api.js';
import { ContributionManager } from './contribution-manager.js';
import type { Directories } from './directories.js';

let contributionManager: ContributionManager;

let composeFileExample: any;

const ociImage = 'quay.io/my-image';
const extensionName = 'my-extension';
const portNumber = 10000;

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const directories = {
  getPluginsDirectory: () => '/fake-plugins-directory',
  getPluginsScanDirectory: () => '/fake-plugins-scanning-directory',
  getExtensionsStorageDirectory: () => '/fake-extensions-storage-directory',
} as unknown as Directories;

beforeAll(() => {
  contributionManager = new ContributionManager(apiSender, directories);
});

beforeEach(() => {
  vi.clearAllMocks();
  composeFileExample = {
    services: {
      'devenv-volumes': {
        image: 'fooImage',
      },
    },
  };
});

test('Should interpret ${DESKTOP_PLUGIN_IMAGE}', async () => {
  const composeFile = {
    services: {
      'devenv-volumes': {
        image: '${DESKTOP_PLUGIN_IMAGE}',
      },
    },
  };
  const result = await contributionManager.doEnhanceCompose(ociImage, extensionName, portNumber, composeFile);

  expect(result.services['devenv-volumes'].image).toBe(ociImage);
});

test('Should add custom labels', async () => {
  const result = await contributionManager.doEnhanceCompose(ociImage, extensionName, portNumber, composeFileExample);

  expect(result.services['devenv-volumes'].labels).toStrictEqual({
    'com.docker.desktop.extension': 'true',
    'com.docker.desktop.extension.name': 'my-extension',
    'io.podman_desktop.PodmanDesktop.extension': 'true',
    'io.podman_desktop.PodmanDesktop.extensionName': 'my-extension',
  });
});

test('Should add restart policy', async () => {
  const result = await contributionManager.doEnhanceCompose(ociImage, extensionName, portNumber, composeFileExample);

  expect(result.services['devenv-volumes'].deploy?.restart_policy?.condition).toBe('always');
});

test('Should add volumes from', async () => {
  const result = await contributionManager.doEnhanceCompose(ociImage, extensionName, portNumber, composeFileExample);

  expect(result.services['devenv-volumes'].volumes_from).toStrictEqual(['podman-desktop-socket']);

  // check the volume is not added on the podman-desktop-socket service
  expect(result.services['podman-desktop-socket'].volumes_from).toBeUndefined();
});

test('Should not add a service to expose port if no socket', async () => {
  const result = await contributionManager.doEnhanceCompose(ociImage, extensionName, portNumber, composeFileExample);

  // check new service is being added
  const podmanDesktopService = result.services['podman-desktop-socket'];
  expect(podmanDesktopService).toBeDefined();

  // check new service is exposing the port
  expect(podmanDesktopService.ports).toBeUndefined();

  // check the volumes is mounted
  expect(podmanDesktopService.volumes).toStrictEqual(['/run/guest-services']);

  // no socket exposure
  expect(podmanDesktopService.command).not.toContain('socat');
});

test('Should add a service to expose port if socket', async () => {
  const socketPath = 'my-socket.sock';
  const result = await contributionManager.doEnhanceCompose(
    ociImage,
    extensionName,
    portNumber,
    composeFileExample,
    socketPath,
  );

  // check new service is being added
  const podmanDesktopService = result.services['podman-desktop-socket'];
  expect(podmanDesktopService).toBeDefined();

  // check new service is exposing the port
  expect(podmanDesktopService.ports).toStrictEqual(['10000:10000']);

  // check the volumes is mounted
  expect(podmanDesktopService.volumes).toStrictEqual(['/run/guest-services']);

  // socket exposure
  expect(podmanDesktopService.command).toContain('socat');
  // socket exposure
  expect(podmanDesktopService.command).toContain(`/run/guest-services/${socketPath}`);
});
