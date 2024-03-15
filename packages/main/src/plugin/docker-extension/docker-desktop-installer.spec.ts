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

import { cp, readFile } from 'node:fs/promises';

import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ContributionManager } from '../contribution-manager.js';
import { DockerDesktopInstaller } from './docker-desktop-installer.js';

let dockerDesktopInstaller: TestDockerDesktopInstaller;

const contributionManager = {
  init: vi.fn(),
  loadMetadata: vi.fn(),
  saveMetadata: vi.fn(),
  findComposeBinary: vi.fn(),
  enhanceComposeFile: vi.fn(),
  startVM: vi.fn(),
} as unknown as ContributionManager;

class TestDockerDesktopInstaller extends DockerDesktopInstaller {}

beforeAll(async () => {
  dockerDesktopInstaller = new TestDockerDesktopInstaller(contributionManager);
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('Check extractExtensionFiles', async () => {
  vi.mock('node:fs/promises');

  const metadataJson = {
    name: 'My Extension',
    icon: 'icon.png',
    ui: {
      myApp: {
        title: 'myApp',
        root: '/ui',
        src: 'index.html',
        backend: {
          socket: 'plugin.sock',
        },
      },
    },
    vm: {
      composefile: 'docker-compose.yaml',
    },
    host: {
      binaries: [
        {
          darwin: [
            {
              path: '/host/darwin',
            },
          ],
          linux: [
            {
              path: '/host/linux',
            },
          ],
          windows: [
            {
              path: '/host/windows',
            },
          ],
        },
      ],
    },
  };

  // mock readFile
  vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(metadataJson));

  // mock the cp of files
  vi.mocked(cp).mockResolvedValue();

  const reportLog: (message: string) => void = vi.fn();

  await dockerDesktopInstaller.extractExtensionFiles('/tmp/source', '/tmp/dest', reportLog);

  // expect cp to be called for each file
  expect(vi.mocked(cp)).toHaveBeenCalledWith(
    expect.stringContaining('metadata.json'),
    expect.stringContaining('metadata.json'),
    { recursive: true },
  );
  expect(vi.mocked(cp)).toHaveBeenCalledWith(expect.stringContaining('icon.png'), expect.stringContaining('icon.png'), {
    recursive: true,
  });
  expect(vi.mocked(cp)).toHaveBeenCalledWith(expect.stringContaining('ui'), expect.stringContaining('ui'), {
    recursive: true,
  });
  expect(vi.mocked(cp)).toHaveBeenCalledWith(
    expect.stringContaining('docker-compose.yaml'),
    expect.stringContaining('docker-compose.yaml'),
    { recursive: true },
  );

  expect(reportLog).toHaveBeenCalledWith(expect.stringContaining('Copying host file'));
});

describe('Check setupContribution', async () => {
  test('Check basic setupContribution', async () => {
    const sendLog: (message: string) => void = vi.fn();
    const sendError: (message: string) => void = vi.fn();

    const metadata = {
      name: 'My Extension',
    };

    // mock loadMetadata with a name
    vi.mocked(contributionManager.loadMetadata).mockResolvedValueOnce(metadata);

    const contrib = await dockerDesktopInstaller.setupContribution(
      'My Extension',
      'my-extension:latest',
      'dest-folder',
      sendLog,
      sendError,
    );

    expect(contrib).toBeDefined();
    expect(contrib?.title).toBe('My Extension');
    expect(contrib?.extensionPath).toContain('dest-folder');
    expect(contrib?.metadata).toBe(metadata);

    // there is a title so saveMetadata
    expect(vi.mocked(contributionManager.saveMetadata)).not.toHaveBeenCalled();

    // expect init called
    expect(vi.mocked(contributionManager.init)).toHaveBeenCalled();

    // no vm  so not calling the enhance compose file
    expect(vi.mocked(contributionManager).findComposeBinary).not.toHaveBeenCalled();
    expect(vi.mocked(contributionManager).enhanceComposeFile).not.toHaveBeenCalled();

    expect(sendError).not.toHaveBeenCalled();

    expect(sendLog).toHaveBeenCalledWith(expect.stringContaining('Extension Successfully installed.'));
  });

  test('Check missing name', async () => {
    const sendLog: (message: string) => void = vi.fn();
    const sendError: (message: string) => void = vi.fn();

    const metadata = {};

    // mock loadMetadata with a name
    vi.mocked(contributionManager.loadMetadata).mockResolvedValueOnce(metadata);

    const contrib = await dockerDesktopInstaller.setupContribution(
      'My Extension',
      'my-extension:latest',
      'dest-folder',
      sendLog,
      sendError,
    );

    expect(contrib).toBeDefined();
    expect(contrib?.title).toBe('My Extension');
    expect(contrib?.extensionPath).toContain('dest-folder');
    expect(contrib?.metadata).toBe(metadata);

    // there is a call to save  metadata
    expect(vi.mocked(contributionManager.saveMetadata)).toHaveBeenCalledWith(
      expect.stringContaining('dest-folder'),
      expect.objectContaining({ name: 'My Extension' }),
    );
  });

  test('Check with vm', async () => {
    const sendLog: (message: string) => void = vi.fn();
    const sendError: (message: string) => void = vi.fn();

    const metadata = {
      vm: {
        composefile: 'docker-compose.yaml',
      },
    };

    // mock loadMetadata with a name
    vi.mocked(contributionManager.loadMetadata).mockResolvedValueOnce(metadata);

    // say that we found the compose binary
    vi.mocked(contributionManager.findComposeBinary).mockResolvedValue('found-docker-compose');

    const contrib = await dockerDesktopInstaller.setupContribution(
      'My Extension',
      'my-extension:latest',
      'dest-folder',
      sendLog,
      sendError,
    );

    expect(contrib).toBeDefined();
    expect(contrib?.title).toBe('My Extension');
    expect(contrib?.extensionPath).toContain('dest-folder');
    expect(contrib?.metadata).toBe(metadata);

    // there is a call to findComposeBinary
    expect(vi.mocked(contributionManager.findComposeBinary)).toHaveBeenCalled();

    // expect call to enhanceComposeFile
    expect(vi.mocked(contributionManager.enhanceComposeFile)).toHaveBeenCalled();

    // expect call to startVM
    expect(vi.mocked(contributionManager.startVM)).toHaveBeenCalled();

    // expect log with binary found
    expect(sendLog).toHaveBeenCalledWith(expect.stringContaining('Compose binary found at'));
  });
});
