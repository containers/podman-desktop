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

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import type { Octokit } from '@octokit/rest';
import * as extensionApi from '@podman-desktop/api';
import { tmpName } from 'tmp-promise';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { KindGithubReleaseArtifactMetadata } from './kind-installer';
import { KindInstaller } from './kind-installer';
import * as util from './util';

let installer: KindInstaller;

vi.mock('@podman-desktop/api', async () => {
  return {
    window: {
      showInformationMessage: vi.fn(),
      showErrorMessage: vi.fn(),
      withProgress: vi.fn(),
      showNotification: vi.fn(),
      showQuickPick: vi.fn(),
    },
    ProgressLocation: {
      APP_ICON: 1,
    },
    env: {
      isLinux: false,
      isMac: false,
      isWindows: false,
    },
    process: {
      exec: vi.fn(),
    },
  };
});

vi.mock('node:os', async () => {
  return {
    platform: vi.fn(),
    arch: vi.fn(),
    homedir: vi.fn(),
  };
});

const listReleasesMock = vi.fn();
const listReleaseAssetsMock = vi.fn();
const getReleaseAssetMock = vi.fn();

const octokitMock: Octokit = {
  repos: {
    listReleases: listReleasesMock,
    listReleaseAssets: listReleaseAssetsMock,
    getReleaseAsset: getReleaseAssetMock,
  },
} as unknown as Octokit;

const telemetryLogUsageMock = vi.fn();
const telemetryLogErrorMock = vi.fn();
const telemetryLoggerMock = {
  logUsage: telemetryLogUsageMock,
  logError: telemetryLogErrorMock,
} as unknown as extensionApi.TelemetryLogger;

beforeEach(() => {
  installer = new KindInstaller('.', telemetryLoggerMock, octokitMock);
  vi.resetAllMocks();

  (extensionApi.env.isLinux as unknown as boolean) = false;
  (extensionApi.env.isWindows as unknown as boolean) = false;
  (extensionApi.env.isMac as unknown as boolean) = false;
});

test.skip('expect installBinaryToSystem to succesfully pass with a binary', async () => {
  (extensionApi.env.isLinux as unknown as boolean) = true;

  // Create a tmp file using tmp-promise
  const filename = await tmpName();

  // "Install" the binary, this should pass sucessfully
  await expect(() => util.installBinaryToSystem(filename, 'tmpBinary')).rejects.toThrowError();
});

test('error: expect installBinaryToSystem to fail with a non existing binary', async () => {
  (extensionApi.env.isLinux as unknown as boolean) = true;

  vi.spyOn(extensionApi.process, 'exec').mockRejectedValue(new Error('test error'));

  await expect(() => util.installBinaryToSystem('test', 'tmpBinary')).rejects.toThrowError('test error');
});

describe('grabLatestsReleasesMetadata', () => {
  test('return latest 5 releases', async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

    // mock the result of listReleases REST API
    const resultREST = JSON.parse(
      fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/kind-github-release-all.json'), 'utf8'),
    );
    listReleasesMock.mockImplementation(() => {
      return { data: resultREST };
    });
    const releases = await installer.grabLatestsReleasesMetadata();
    expect(releases).toBeDefined();
    expect(releases.length).toBe(5);
  });
});

describe('promptUserForVersion', () => {
  test('return selected version', async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

    // mock the result of listReleases REST API
    const resultREST: KindGithubReleaseArtifactMetadata[] = JSON.parse(
      fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/kind-github-release-all.json'), 'utf8'),
    );
    listReleasesMock.mockImplementation(() => {
      return { data: resultREST };
    });
    const showQuickPickMock = vi.spyOn(extensionApi.window, 'showQuickPick').mockResolvedValue(resultREST[0]);
    const release = await installer.promptUserForVersion();

    expect(showQuickPickMock).toBeCalledWith(expect.any(Array), {
      placeHolder: 'Select Kind version to download',
    });
    expect(release).toBeDefined();
    expect(release.id).toBe(resultREST[0].id);
  });
  test('throw error if no version is selected', async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

    // mock the result of listReleases REST API
    const resultREST: KindGithubReleaseArtifactMetadata[] = JSON.parse(
      fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/kind-github-release-all.json'), 'utf8'),
    );
    listReleasesMock.mockImplementation(() => {
      return { data: resultREST };
    });
    vi.spyOn(extensionApi.window, 'showQuickPick').mockResolvedValue(undefined);
    await expect(() => installer.promptUserForVersion()).rejects.toThrowError('No version selected');
  });
});

describe('getReleaseAssetId', () => {
  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

    // mock the result of listReleaseAssetsMock REST API
    const resultREST = JSON.parse(
      fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/kind-github-release-assets.json'), 'utf8'),
    );

    listReleaseAssetsMock.mockImplementation(() => {
      return { data: resultREST };
    });
  });

  test('macOS x86_64', async () => {
    const result = await installer.getReleaseAssetId(170076920, 'darwin', 'x64');
    expect(result).toBeDefined();
    expect(result).toBe(186178216);
  });

  test('macOS arm64', async () => {
    const result = await installer.getReleaseAssetId(170076920, 'darwin', 'arm64');
    expect(result).toBeDefined();
    expect(result).toBe(186178219);
  });

  test('windows x86_64', async () => {
    const result = await installer.getReleaseAssetId(170076920, 'win32', 'x64');
    expect(result).toBeDefined();
    expect(result).toBe(186178238);
  });

  test('windows arm64', async () => {
    await expect(installer.getReleaseAssetId(170076920, 'win32', 'arm64')).rejects.toThrow();
  });

  test('linux x86_64', async () => {
    const result = await installer.getReleaseAssetId(170076920, 'linux', 'x64');
    expect(result).toBeDefined();
    expect(result).toBe(186178226);
  });

  test('linux arm64', async () => {
    const result = await installer.getReleaseAssetId(170076920, 'linux', 'arm64');
    expect(result).toBeDefined();
    expect(result).toBe(186178234);
  });

  test('invalid', async () => {
    await expect(installer.getReleaseAssetId(170076920, 'invalid', 'invalid')).rejects.toThrow();
  });
});

describe('getKindCliStoragePath', () => {
  test('return kind.exe path for windows', async () => {
    (extensionApi.env.isWindows as unknown as boolean) = true;
    const path = installer.getKindCliStoragePath();
    expect(path.endsWith('kind.exe')).toBeTruthy();
  });
  test('return kind path for mac', async () => {
    (extensionApi.env.isMac as unknown as boolean) = true;
    const path = installer.getKindCliStoragePath();
    expect(path.endsWith('kind')).toBeTruthy();
  });
  test('return kind path for linux', async () => {
    (extensionApi.env.isLinux as unknown as boolean) = true;
    const path = installer.getKindCliStoragePath();
    expect(path.endsWith('kind')).toBeTruthy();
  });
});

describe('install', () => {
  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

    // mock the result of listReleaseAssetsMock REST API
    const resultREST = JSON.parse(
      fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/kind-github-release-assets.json'), 'utf8'),
    );

    listReleaseAssetsMock.mockImplementation(() => {
      return { data: resultREST };
    });
  });
  test('should download file on win system', async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

    // mock the result of listReleases REST API
    const resultREST: KindGithubReleaseArtifactMetadata[] = JSON.parse(
      fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/kind-github-release-all.json'), 'utf8'),
    );
    listReleasesMock.mockImplementation(() => {
      return { data: resultREST };
    });
    vi.mocked(os.platform).mockReturnValue('win32');
    vi.mocked(os.arch).mockReturnValue('x64');
    vi.mock('node:fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const chmodMock = vi.spyOn(fs.promises, 'chmod');
    const downloadReleaseAssetMock = vi
      .spyOn(installer, 'downloadReleaseAsset')
      .mockImplementation(() => Promise.resolve());
    await installer.download(resultREST[0]);
    expect(downloadReleaseAssetMock).toBeCalledWith(186178238, expect.any(String));
    expect(chmodMock).not.toBeCalled();
  });
  test('should download and set permissions on file on non-win system', async () => {
    (extensionApi.env.isMac as unknown as boolean) = true;
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

    // mock the result of listReleases REST API
    const resultREST: KindGithubReleaseArtifactMetadata[] = JSON.parse(
      fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/kind-github-release-all.json'), 'utf8'),
    );
    listReleasesMock.mockImplementation(() => {
      return { data: resultREST };
    });
    vi.mocked(os.platform).mockReturnValue('darwin');
    vi.mocked(os.arch).mockReturnValue('x64');
    vi.mock('node:fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const chmodMock = vi.spyOn(fs.promises, 'chmod');
    const downloadReleaseAssetMock = vi
      .spyOn(installer, 'downloadReleaseAsset')
      .mockImplementation(() => Promise.resolve());
    await installer.download(resultREST[0]);
    expect(downloadReleaseAssetMock).toBeCalledWith(186178216, expect.any(String));
    expect(chmodMock).toBeCalledWith(expect.any(String), 0o755);
  });
});

describe('downloadReleaseAsset', () => {
  test('should download the file if parent folder does exist', async () => {
    vi.mock('node:fs');

    getReleaseAssetMock.mockImplementation(() => {
      return { data: 'foo' };
    });

    // mock fs
    const existSyncSpy = vi.spyOn(fs, 'existsSync').mockImplementation(() => {
      return true;
    });

    const writeFileSpy = vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();

    // generate a temporary file
    const destFile = '/fake/path/to/file';
    await installer.downloadReleaseAsset(123, destFile);
    // check that parent director has been checked
    expect(existSyncSpy).toBeCalledWith('/fake/path/to');

    // check that we've written the file
    expect(writeFileSpy).toBeCalledWith(destFile, Buffer.from('foo'));
  });

  test('should download the file if parent folder does not exist', async () => {
    vi.mock('node:fs');

    getReleaseAssetMock.mockImplementation(() => {
      return { data: 'foo' };
    });

    // mock fs
    const existSyncSpy = vi.spyOn(fs, 'existsSync').mockImplementation(() => {
      return false;
    });
    const mkdirSpy = vi.spyOn(fs.promises, 'mkdir').mockImplementation(async () => {
      return '';
    });

    const writeFileSpy = vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();

    // generate a temporary file
    const destFile = '/fake/path/to/file';
    await installer.downloadReleaseAsset(123, destFile);
    // check that parent director has been checked
    expect(existSyncSpy).toBeCalledWith('/fake/path/to');

    // check that we've created the parent folder
    expect(mkdirSpy).toBeCalledWith('/fake/path/to', { recursive: true });

    // check that we've written the file
    expect(writeFileSpy).toBeCalledWith(destFile, Buffer.from('foo'));
  });
});
