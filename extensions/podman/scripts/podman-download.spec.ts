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

import { afterEach } from 'node:test';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PodmanDownload, PodmanDownloadFcosImage, PodmanDownloadFedoraImage, ShaCheck } from './podman-download';
import * as podman4JSON from '../src/podman4.json';
import nock from 'nock';
import { appendFileSync, existsSync, mkdirSync } from 'node:fs';

const mockedPodman4 = {
  version: '4.5.0',
  platform: {
    win32: {
      version: 'v4.5.0',
      fileName: 'podman-4.5.0-setup.exe',
    },
    darwin: {
      version: 'v4.5.0',
      arch: {
        x64: {
          fileName: 'podman-installer-macos-amd64-v4.5.0.pkg',
        },
        arm64: {
          fileName: 'podman-installer-macos-aarch64-v4.5.0.pkg',
        },
        universal: {
          fileName: 'podman-installer-macos-universal-v4.5.0.pkg',
        },
      },
    },
  },
};

class TestPodmanDownload extends PodmanDownload {
  async downloadAndCheckSha(tagVersion: string, fileName: string, artifactName: string): Promise<void> {
    return super.downloadAndCheckSha(tagVersion, fileName, artifactName);
  }

  public getPodmanDownloadFcosImage(): PodmanDownloadFcosImage {
    return super.getPodmanDownloadFcosImage();
  }

  public getPodmanDownloadFedoraImage(): PodmanDownloadFedoraImage {
    return super.getPodmanDownloadFedoraImage();
  }

  public getShaCheck(): ShaCheck {
    return super.getShaCheck();
  }
}

describe('macOS platform', () => {
  let currentPlatform: string;
  beforeEach(() => {
    vi.mock('node:fs');

    currentPlatform = process.platform;
    // define using setProperty
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
    });
  });

  afterEach(() => {
    // reset the platform
    Object.defineProperty(process, 'platform', {
      value: currentPlatform,
    });

    delete process.env.AIRGAP_DOWNLOAD;
  });

  test('PodmanDownload with real json', async () => {
    const podmanDownload = new TestPodmanDownload(podman4JSON, true);

    // mock downloadAndCheckSha
    const downloadAndCheckShaSpy = vi.spyOn(podmanDownload, 'downloadAndCheckSha');
    downloadAndCheckShaSpy.mockResolvedValue();

    // mock podmanDownloadFcosImage
    const podmanDownloadFcosImage = podmanDownload.getPodmanDownloadFcosImage();
    const podmanDownloadFcosImageSpy = vi.spyOn(podmanDownloadFcosImage, 'download');
    podmanDownloadFcosImageSpy.mockResolvedValue();

    // add env file
    process.env.AIRGAP_DOWNLOAD = 'yes';

    await podmanDownload.downloadBinaries();

    // check called 2 times
    expect(downloadAndCheckShaSpy).toHaveBeenCalledTimes(2);

    // check called with the correct parameters
    expect(downloadAndCheckShaSpy).toHaveBeenCalledWith(
      expect.stringContaining('v4.'),
      expect.stringContaining('podman-installer-macos-amd64'),
      'podman-installer-macos-amd64.pkg',
    );
    expect(downloadAndCheckShaSpy).toHaveBeenCalledWith(
      expect.stringContaining('v4.'),
      expect.stringContaining('podman-installer-macos-aarch64'),
      'podman-installer-macos-arm64.pkg',
    );

    // check airgap download
    expect(podmanDownloadFcosImageSpy).toHaveBeenCalled();
    expect(podmanDownloadFcosImageSpy).toHaveBeenCalledWith('arm64');
    expect(podmanDownloadFcosImageSpy).toHaveBeenCalledWith('x64');
  });

  test('PodmanDownload with mocked json', async () => {
    const podmanDownload = new TestPodmanDownload(mockedPodman4, false);

    // mock downloadAndCheckSha
    const downloadAndCheckShaSpy = vi.spyOn(podmanDownload, 'downloadAndCheckSha');
    downloadAndCheckShaSpy.mockResolvedValue();

    await podmanDownload.downloadBinaries();

    // check called 3 (one for each arch + universal) times
    expect(downloadAndCheckShaSpy).toHaveBeenCalledTimes(3);

    // check called with the correct parameters
    expect(downloadAndCheckShaSpy).toHaveBeenNthCalledWith(
      1,
      'v4.5.0',
      'podman-installer-macos-amd64-v4.5.0.pkg',
      'podman-installer-macos-amd64.pkg',
    );
    expect(downloadAndCheckShaSpy).toHaveBeenNthCalledWith(
      2,
      'v4.5.0',
      'podman-installer-macos-aarch64-v4.5.0.pkg',
      'podman-installer-macos-arm64.pkg',
    );
    expect(downloadAndCheckShaSpy).toHaveBeenNthCalledWith(
      3,
      'v4.5.0',
      'podman-installer-macos-universal-v4.5.0.pkg',
      'podman-installer-macos-universal.pkg',
    );
  });
});

describe('windows platform', () => {
  let currentPlatform: string;
  beforeEach(() => {
    currentPlatform = process.platform;
    // define using setProperty
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    });
  });

  afterEach(() => {
    // reset the platform
    Object.defineProperty(process, 'platform', {
      value: currentPlatform,
    });
    delete process.env.AIRGAP_DOWNLOAD;
  });

  test('PodmanDownload with real data', async () => {
    const podmanDownload = new TestPodmanDownload(podman4JSON, true);

    // mock downloadAndCheckSha
    const downloadAndCheckShaSpy = vi.spyOn(podmanDownload, 'downloadAndCheckSha');
    downloadAndCheckShaSpy.mockResolvedValue();

    // add env file
    process.env.AIRGAP_DOWNLOAD = 'yes';

    // mock podmanDownloadFedoraImage
    const podmanDownloadFedoraImage = podmanDownload.getPodmanDownloadFedoraImage();
    const podmanDownloadFedoraImageSpy = vi.spyOn(podmanDownloadFedoraImage, 'download');
    podmanDownloadFedoraImageSpy.mockResolvedValue();

    await podmanDownload.downloadBinaries();

    // check called once
    expect(downloadAndCheckShaSpy).toHaveBeenCalled();

    // check called with the correct parameters
    expect(downloadAndCheckShaSpy).toHaveBeenCalledWith(
      expect.stringContaining('v4.'),
      expect.stringContaining('-setup.exe'),
      expect.stringContaining('-setup.exe'),
    );

    // check airgap download
    expect(podmanDownloadFedoraImageSpy).toHaveBeenCalled();
    expect(podmanDownloadFedoraImageSpy).toHaveBeenCalledWith('podman-wsl-fedora', 'x64');
    expect(podmanDownloadFedoraImageSpy).toHaveBeenCalledWith('podman-wsl-fedora-arm', 'arm64');
  });

  test('PodmanDownload with mocked json', async () => {
    const podmanDownload = new TestPodmanDownload(mockedPodman4, false);

    // mock downloadAndCheckSha
    const downloadAndCheckShaSpy = vi.spyOn(podmanDownload, 'downloadAndCheckSha');
    downloadAndCheckShaSpy.mockResolvedValue();

    const podmanDownloadFedoraImage = podmanDownload.getPodmanDownloadFedoraImage();
    const podmanDownloadFedoraImageSpy = vi.spyOn(podmanDownloadFedoraImage, 'download');

    await podmanDownload.downloadBinaries();

    // check called
    expect(downloadAndCheckShaSpy).toHaveBeenCalled();

    // check called with the correct parameters
    expect(downloadAndCheckShaSpy).toHaveBeenNthCalledWith(
      1,
      'v4.5.0',
      'podman-4.5.0-setup.exe',
      'podman-4.5.0-setup.exe',
    );

    // check no airgap download
    expect(podmanDownloadFedoraImageSpy).not.toHaveBeenCalled();
  });
});

test('downloadAndCheckSha', async () => {
  vi.mocked(existsSync).mockReturnValue(false);
  vi.mocked(mkdirSync).mockReturnValue('');

  // mock GitHub requests

  const response = {
    name: 'vFakeVersion',
    assets: [
      {
        url: 'https://api.github.com/repos/containers/podman/releases/assets/456',
        id: 456,
        name: 'podman-fake-binary',
        browser_download_url: 'https://github.com/containers/podman/releases/download/vFakeVersion/podman-binary',
      },

      {
        url: 'https://api.github.com/repos/containers/podman/releases/assets/789',
        id: 789,
        name: 'shasums',
        browser_download_url: 'https://github.com/containers/podman/releases/download/vFakeVersion/shasums',
      },
    ],
  };

  nock('https://api.github.com').get('/repos/containers/podman/releases/tags/vFakeVersion').reply(200, response);

  // shasums content
  const shasumContent = 'fake-sha podman-fake-binary\n';
  nock('https://api.github.com')
    .get('/repos/containers/podman/releases/assets/789')
    .reply(200, shasumContent, {
      'content-type': 'application/octet-stream',
      'content-length': `${shasumContent.length}`,
      'content-disposition': 'attachment; filename=binary.zip',
    });

  // podman-binary content
  const podmanBinaryContent = 'fake-binary-content';
  nock('https://api.github.com')
    .get('/repos/containers/podman/releases/assets/456')
    .reply(200, podmanBinaryContent, {
      'content-type': 'application/octet-stream',
      'content-length': `${podmanBinaryContent.length}`,
      'content-disposition': 'attachment; filename=binary.zip',
    });

  const podmanDownload = new TestPodmanDownload(mockedPodman4, false);
  const shaCheck = podmanDownload.getShaCheck();
  const shaCheckSpy = vi.spyOn(shaCheck, 'checkFile');
  shaCheckSpy.mockResolvedValue(true);

  await podmanDownload.downloadAndCheckSha('vFakeVersion', 'podman-fake-binary', 'podman-fake-binary');

  // check we wrote the file
  expect(appendFileSync).toHaveBeenCalledWith(
    expect.stringContaining('podman-fake-binary'),
    Buffer.from(podmanBinaryContent),
  );

  // check the sha
  expect(shaCheckSpy).toHaveBeenCalledWith(expect.stringContaining('podman-fake-binary'), 'fake-sha');
});
