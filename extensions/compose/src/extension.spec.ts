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

import type { CliTool, Logger } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { installBinaryToSystem } from './cli-run';
import type { ComposeGithubReleaseArtifactMetadata } from './compose-github-releases';
import { Detect } from './detect';
import { ComposeDownload } from './download';
import { activate, deactivate } from './extension';

vi.mock('@podman-desktop/api', async () => {
  return {
    process: {
      exec: vi.fn(),
    },
    env: {
      isLinux: false,
      isWindows: false,
      isMac: false,
      createTelemetryLogger: vi.fn(),
    },
    configuration: {
      onDidChangeConfiguration: vi.fn(),
      getConfiguration: (): extensionApi.Configuration =>
        ({
          update: vi.fn(),
          get: vi.fn(),
          has: vi.fn(),
        }) as unknown as extensionApi.Configuration,
    },
    context: {
      setValue: vi.fn(),
    },
    commands: {
      registerCommand: vi.fn(),
    },
    provider: {
      createProvider: vi.fn(),
    },
    cli: {
      createCliTool: vi.fn(),
    },
  };
});

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

const detectMock = {
  checkSystemWideDockerCompose: vi.fn(),
  getDockerComposeBinaryInfo: vi.fn(),
  getStoragePath: vi.fn(),
  getExtensionStorageBin: vi.fn(),
} as unknown as Detect;

const composeDownloadMock = {
  getLatestVersionAsset: vi.fn(),
  download: vi.fn(),
} as unknown as ComposeDownload;

const cliToolMock = {
  registerUpdate: vi.fn(),
  updateVersion: vi.fn(),
  dispose: vi.fn(),
} as unknown as CliTool;

vi.mock('./cli-run', () => ({
  installBinaryToSystem: vi.fn(),
}));

vi.mock('./detect', () => ({
  Detect: vi.fn(),
}));

vi.mock('./download', () => ({
  ComposeDownload: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(Detect).mockReturnValue(detectMock);
  vi.mocked(ComposeDownload).mockReturnValue(composeDownloadMock);
  vi.mocked(extensionApi.cli.createCliTool).mockReturnValue(cliToolMock);
});

afterEach(() => {
  return deactivate();
});

const extensionContextMock = {
  storagePath: 'dummy-storage-path',
  subscriptions: [],
} as unknown as extensionApi.ExtensionContext;

test('commands registered', async () => {
  await activate(extensionContextMock);

  [
    'compose.onboarding.checkDownloadedCommand',
    'compose.onboarding.downloadCommand',
    'compose.onboarding.promptUserForVersion',
    'compose.onboarding.installSystemWideCommand',
  ].forEach(command => {
    expect(extensionApi.commands.registerCommand).toHaveBeenCalledWith(command, expect.any(Function));
  });
});

test('provider registered', async () => {
  await activate(extensionContextMock);

  expect(extensionApi.provider.createProvider).toHaveBeenCalledWith({
    emptyConnectionMarkdownDescription: expect.any(String),
    name: 'Compose',
    id: 'Compose',
    status: 'unknown',
    images: {
      icon: './icon.png',
    },
  });
});

test('downloadCommand should register cli tool if required', async () => {
  vi.mocked(detectMock.checkSystemWideDockerCompose).mockResolvedValue(false);
  vi.mocked(detectMock.getStoragePath).mockResolvedValue('');

  vi.mocked(detectMock.getDockerComposeBinaryInfo).mockResolvedValue({
    version: 'v0.0.0',
    path: 'system-wide-path',
    updatable: false,
  });

  vi.mocked(composeDownloadMock.getLatestVersionAsset).mockResolvedValue({
    tag: 'v1.0.0',
  } as unknown as ComposeGithubReleaseArtifactMetadata);

  vi.mocked(extensionApi.commands.registerCommand).mockImplementation((command, callback) => {
    if (command === 'compose.onboarding.downloadCommand') {
      expect(extensionApi.cli.createCliTool).not.toHaveBeenCalled();
      vi.mocked(detectMock.getStoragePath).mockResolvedValue('storage-path');
      vi.mocked(detectMock.getExtensionStorageBin).mockResolvedValue('storage-path');
      callback();
    }

    return {
      dispose: vi.fn(),
    };
  });

  await activate(extensionContextMock);

  await vi.waitFor(() => {
    expect(extensionApi.cli.createCliTool).toHaveBeenCalled();
  });
});

/**
 * (1) The postActivate will call createCliTool
 * (2) if a new version is available, registerUpdate will be called
 *
 * This function return the object provided to the registerUpdate method
 */
async function getCliToolUpdate(updatable: boolean): Promise<extensionApi.CliToolUpdate> {
  vi.mocked(detectMock.checkSystemWideDockerCompose).mockResolvedValue(true);
  vi.mocked(detectMock.getDockerComposeBinaryInfo).mockResolvedValue({
    version: 'v0.0.0',
    path: 'system-wide-path',
    updatable: updatable,
  });
  vi.mocked(composeDownloadMock.getLatestVersionAsset).mockResolvedValue({
    tag: 'v1.0.0',
  } as unknown as ComposeGithubReleaseArtifactMetadata);

  let update: extensionApi.CliToolUpdate | undefined = undefined;
  vi.mocked(cliToolMock.registerUpdate).mockImplementation(mUpdate => {
    update = mUpdate;
    return { dispose: vi.fn() };
  });

  await activate(extensionContextMock);

  await vi.waitFor(() => {
    expect(update).toBeDefined();
  });

  if (!update) throw new Error('undefined update');
  return update;
}

describe('registerCLITool', () => {
  test('createCliTool already installed system wide', async () => {
    vi.mocked(detectMock.checkSystemWideDockerCompose).mockResolvedValue(true);
    vi.mocked(detectMock.getDockerComposeBinaryInfo).mockResolvedValue({
      version: 'v0.0.0',
      path: 'system-wide-path',
      updatable: false, // not updatable as unknown location
    });
    vi.mocked(composeDownloadMock.getLatestVersionAsset).mockResolvedValue({
      tag: 'v0.0.0',
    } as unknown as ComposeGithubReleaseArtifactMetadata);

    await activate(extensionContextMock);

    await vi.waitFor(() => {
      expect(extensionApi.cli.createCliTool).toHaveBeenCalledWith({
        name: 'docker-compose',
        displayName: 'Compose',
        markdownDescription: expect.any(String),
        images: expect.anything(),
        version: '0.0.0',
        path: 'system-wide-path',
      });
    });

    expect(cliToolMock.registerUpdate).not.toHaveBeenCalled();
  });

  test('new version docker-compose available', async () => {
    vi.mocked(detectMock.checkSystemWideDockerCompose).mockResolvedValue(true);
    vi.mocked(detectMock.getDockerComposeBinaryInfo).mockResolvedValue({
      version: 'v0.0.0',
      path: 'system-wide-path',
      updatable: false, // not updatable as unknown location
    });
    vi.mocked(composeDownloadMock.getLatestVersionAsset).mockResolvedValue({
      tag: 'v1.0.0',
    } as unknown as ComposeGithubReleaseArtifactMetadata);

    await activate(extensionContextMock);

    await vi.waitFor(() => {
      expect(extensionApi.cli.createCliTool).toHaveBeenCalled();
      expect(cliToolMock.registerUpdate).toHaveBeenCalledWith({
        version: '1.0.0',
        doUpdate: expect.any(Function),
      });
    });
  });

  test('update not updatable version should throw an error', async () => {
    const update: extensionApi.CliToolUpdate = await getCliToolUpdate(false);

    await expect(() => update?.doUpdate({} as unknown as Logger)).rejects.toThrowError(
      'Cannot update system-wide-path version 0.0.0 to 1.0.0 as it was not installed by podman-desktop',
    );
  });

  test('update updatable version should update version', async () => {
    vi.mocked(detectMock.getStoragePath).mockResolvedValue('extension-storage-path');
    const update: extensionApi.CliToolUpdate = await getCliToolUpdate(true);

    await update.doUpdate({} as unknown as Logger);

    expect(composeDownloadMock.download).toHaveBeenCalledWith({
      tag: 'v1.0.0',
    });
    expect(detectMock.getStoragePath).toHaveBeenCalled();
    expect(installBinaryToSystem).toHaveBeenCalledWith('extension-storage-path', 'docker-compose');
    expect(cliToolMock.updateVersion).toHaveBeenCalledWith({
      version: '1.0.0',
    });
  });
});
