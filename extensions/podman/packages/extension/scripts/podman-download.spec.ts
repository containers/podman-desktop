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
import {
  DownloadAndCheck,
  Podman5DownloadFedoraImage,
  Podman5DownloadMachineOS,
  PodmanDownload,
  ShaCheck,
} from './podman-download';
import * as podman5JSON from '../src/podman5.json';
import nock from 'nock';
import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { Octokit } from 'octokit';
import { Readable, Writable } from 'node:stream';
import { WritableStream } from 'stream/web';

const mockedPodman5 = {
  version: '5.0.0',
  platform: {
    win32: {
      version: 'v5.0.0',
      fileName: 'podman-5.0.0-setup.exe',
    },
    darwin: {
      version: 'v5.0.0',
      arch: {
        x64: {
          fileName: 'podman-installer-macos-amd64-v5.0.0.pkg',
        },
        arm64: {
          fileName: 'podman-installer-macos-aarch64-v5.0.0.pkg',
        },
        universal: {
          fileName: 'podman-installer-macos-universal-v5.0.0.pkg',
        },
      },
    },
  },
};

class TestPodmanDownload extends PodmanDownload {
  public getPodman5DownloadFedoraImage(): Podman5DownloadFedoraImage {
    return super.getPodman5DownloadFedoraImage();
  }

  public getPodman5DownloadMachineOS(): Podman5DownloadMachineOS {
    return super.getPodman5DownloadMachineOS();
  }

  public getShaCheck(): ShaCheck {
    return super.getShaCheck();
  }

  public getDownloadAndCheck(): DownloadAndCheck {
    return super.getDownloadAndCheck();
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
    const podmanDownload = new TestPodmanDownload(podman5JSON, true);

    // mock downloadAndCheckSha
    const downloadCheck = podmanDownload.getDownloadAndCheck();
    const downloadAndCheckShaSpy = vi.spyOn(downloadCheck, 'downloadAndCheckSha');
    downloadAndCheckShaSpy.mockResolvedValue();

    // mock podman5DownloadMachineOS
    const podman5DownloadMachineOS = podmanDownload.getPodman5DownloadMachineOS();
    const podman5DownloadMachineOSSpy = vi.spyOn(podman5DownloadMachineOS, 'download');
    podman5DownloadMachineOSSpy.mockResolvedValue();

    // add env file
    process.env.AIRGAP_DOWNLOAD = 'yes';

    await podmanDownload.downloadBinaries();

    // check called 2 times
    expect(downloadAndCheckShaSpy).toHaveBeenCalledTimes(3);

    // check called with the correct parameters
    expect(downloadAndCheckShaSpy).toHaveBeenCalledWith(
      expect.stringContaining('v5.'),
      expect.stringContaining('podman-installer-macos-amd64'),
      'podman-installer-macos-amd64.pkg',
    );
    expect(downloadAndCheckShaSpy).toHaveBeenCalledWith(
      expect.stringContaining('v5.'),
      expect.stringContaining('podman-installer-macos-aarch64'),
      'podman-installer-macos-arm64.pkg',
    );

    // check airgap download
    expect(podman5DownloadMachineOSSpy).toHaveBeenCalled();
  });

  test('PodmanDownload with mocked json', async () => {
    const podmanDownload = new TestPodmanDownload(mockedPodman5, false);

    // mock downloadAndCheckSha
    const downloadCheck = podmanDownload.getDownloadAndCheck();
    const downloadAndCheckShaSpy = vi.spyOn(downloadCheck, 'downloadAndCheckSha');
    downloadAndCheckShaSpy.mockResolvedValue();

    await podmanDownload.downloadBinaries();

    // check called 3 (one for each arch + universal) times
    expect(downloadAndCheckShaSpy).toHaveBeenCalledTimes(3);

    // check called with the correct parameters
    expect(downloadAndCheckShaSpy).toHaveBeenNthCalledWith(
      1,
      'v5.0.0',
      'podman-installer-macos-amd64-v5.0.0.pkg',
      'podman-installer-macos-amd64.pkg',
    );
    expect(downloadAndCheckShaSpy).toHaveBeenNthCalledWith(
      2,
      'v5.0.0',
      'podman-installer-macos-aarch64-v5.0.0.pkg',
      'podman-installer-macos-arm64.pkg',
    );
    expect(downloadAndCheckShaSpy).toHaveBeenNthCalledWith(
      3,
      'v5.0.0',
      'podman-installer-macos-universal-v5.0.0.pkg',
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
    const podmanDownload = new TestPodmanDownload(podman5JSON, true);

    // mock downloadAndCheckSha
    const downloadCheck = podmanDownload.getDownloadAndCheck();
    const downloadAndCheckShaSpy = vi.spyOn(downloadCheck, 'downloadAndCheckSha');
    downloadAndCheckShaSpy.mockResolvedValue();

    // add env file
    process.env.AIRGAP_DOWNLOAD = 'yes';

    // mock podmanDownloadFedoraImage
    const podman5DownloadFedoraImage = podmanDownload.getPodman5DownloadFedoraImage();
    const podman5DownloadFedoraImageSpy = vi.spyOn(podman5DownloadFedoraImage, 'download');
    podman5DownloadFedoraImageSpy.mockResolvedValue();

    await podmanDownload.downloadBinaries();

    // check called once
    expect(downloadAndCheckShaSpy).toHaveBeenCalled();

    // check called with the correct parameters
    expect(downloadAndCheckShaSpy).toHaveBeenCalledWith(
      expect.stringContaining('v5.'),
      expect.stringContaining('-setup.exe'),
      expect.stringContaining('-setup.exe'),
    );

    // check airgap download
    expect(podman5DownloadFedoraImageSpy).toHaveBeenCalled();
    expect(podman5DownloadFedoraImageSpy).toHaveBeenCalledWith('x64');
    expect(podman5DownloadFedoraImageSpy).toHaveBeenCalledWith('arm64');
  });

  test('PodmanDownload with mocked json', async () => {
    const podmanDownload = new TestPodmanDownload(mockedPodman5, false);

    // mock downloadAndCheckSha
    const downloadCheck = podmanDownload.getDownloadAndCheck();
    const downloadAndCheckShaSpy = vi.spyOn(downloadCheck, 'downloadAndCheckSha');
    downloadAndCheckShaSpy.mockResolvedValue();

    const podman5DownloadFedoraImage = podmanDownload.getPodman5DownloadFedoraImage();
    const podmanDownloadFedoraImageSpy = vi.spyOn(podman5DownloadFedoraImage, 'download');

    await podmanDownload.downloadBinaries();

    // check called
    expect(downloadAndCheckShaSpy).toHaveBeenCalled();

    // check called with the correct parameters
    expect(downloadAndCheckShaSpy).toHaveBeenNthCalledWith(
      1,
      'v5.0.0',
      'podman-5.0.0-setup.exe',
      'podman-5.0.0-setup.exe',
    );

    // check no airgap download
    expect(podmanDownloadFedoraImageSpy).not.toHaveBeenCalled();
  });
});
test('downloadAndCheckSha', async () => {
  vi.mocked(existsSync).mockReturnValue(false);
  vi.mocked(mkdirSync).mockReturnValue('');

  const shaCheck = {
    checkFile: vi.fn(),
  } as unknown as ShaCheck;
  // mock GitHub requests

  vi.mocked(shaCheck.checkFile).mockResolvedValue(true);

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

  const octokit = new Octokit();

  const podmanDownload = new DownloadAndCheck(octokit, shaCheck, 'fake-directory');

  await podmanDownload.downloadAndCheckSha('vFakeVersion', 'podman-fake-binary', 'podman-fake-binary');

  // check we wrote the file
  expect(appendFileSync).toHaveBeenCalledWith(
    expect.stringContaining('podman-fake-binary'),
    Buffer.from(podmanBinaryContent),
  );

  // check the sha
  expect(shaCheck.checkFile).toHaveBeenCalledWith(expect.stringContaining('podman-fake-binary'), 'fake-sha');
});

describe('Podman5DownloadMachineOS', () => {
  const shaCheck = {
    checkFile: vi.fn(),
  } as unknown as ShaCheck;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(shaCheck.checkFile).mockResolvedValue(true);
  });

  class TestPodman5DownloadMachineOS extends Podman5DownloadMachineOS {
    public pipe(
      title: string,
      total: number,
      stream: ReadableStream<Uint8Array>,
      writableStream: globalThis.WritableStream<Uint8Array>,
    ): Promise<void> {
      return super.pipe(title, total, stream, writableStream);
    }
  }

  test('download all the files and perform checks', async () => {
    // spy Writable.toWeb
    vi.spyOn(Writable, 'toWeb').mockResolvedValue({} as unknown as WritableStream);

    // mock manifests
    const rootManifest = {
      schemaVersion: 2,
      mediaType: 'application/vnd.oci.image.index.v1+json',
      manifests: [
        {
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          digest: 'sha256:123amd64',
          size: 481,
          annotations: {
            disktype: 'applehv',
          },
          platform: {
            architecture: 'x86_64',
            os: 'linux',
          },
        },
        {
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          digest: 'sha256:456arm64',
          size: 482,
          annotations: {
            disktype: 'applehv',
          },
          platform: {
            architecture: 'aarch64',
            os: 'linux',
          },
        },
        {
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          digest: 'sha256:ee45494db66e33525f50835af65c4099db4db7a066b1da9a85fba7e88f95f594',
          size: 481,
          annotations: {
            disktype: 'hyperv',
          },
          platform: {
            architecture: 'x86_64',
            os: 'linux',
          },
        },
        {
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          digest: 'sha256:56bbdde7b2dc8714a0397f37ae1c8ac1353ed3e4de1b09c1db791d6fa5bc56fa',
          size: 482,
          annotations: {
            disktype: 'hyperv',
          },
          platform: {
            architecture: 'aarch64',
            os: 'linux',
          },
        },
        {
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          digest: 'sha256:c25ce5ba618f870f88c418c7aa0f176af4a7b32ed39aa328a8e27eae5a497e11',
          size: 480,
          annotations: {
            disktype: 'qemu',
          },
          platform: {
            architecture: 'x86_64',
            os: 'linux',
          },
        },
        {
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          digest: 'sha256:9a9285bd1a01e5b4c5b27467025cc5da281e250913432a9f92cf8fe1668fec19',
          size: 481,
          annotations: {
            disktype: 'qemu',
          },
          platform: {
            architecture: 'aarch64',
            os: 'linux',
          },
        },
        {
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          digest: 'sha256:34f21a8b9b8b9ff13fc348f8eba72fa92e74e52caa9984a78b68a7f5822641c7',
          size: 11003,
          platform: {
            architecture: 'aarch64',
            os: 'linux',
          },
        },
        {
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          digest: 'sha256:c7bbce32d96c44b0db6e05a3f78fa4cb11f578c7d18cec49d23a7d6b40843a05',
          size: 11009,
          platform: {
            architecture: 'x86_644',
            os: 'linux',
          },
        },
      ],
    };

    nock('https://quay.io').get('/v2/podman/machine-os/manifests/1.0-fake').reply(200, rootManifest);

    // fake digest for amd64
    nock('https://quay.io')
      .get('/v2/podman/machine-os/manifests/sha256:123amd64')
      .reply(200, {
        schemaVersion: 2,
        mediaType: 'application/vnd.oci.image.manifest.v1+json',
        config: {
          mediaType: 'application/vnd.oci.empty.v1+json',
          digest: 'sha256:1234',
          size: 2,
          data: 'e30=',
        },
        layers: [
          {
            mediaType: 'application/zstd',
            digest: 'sha256:zstfakeamd64digest',
            size: 1233263850,
            annotations: {
              'org.opencontainers.image.title': 'podman-machine-daily.amd64.applehv.raw.zst',
            },
          },
        ],
      });

    // fake digest for arm64
    nock('https://quay.io')
      .get('/v2/podman/machine-os/manifests/sha256:456arm64')
      .reply(200, {
        schemaVersion: 2,
        mediaType: 'application/vnd.oci.image.manifest.v1+json',
        config: {
          mediaType: 'application/vnd.oci.empty.v1+json',
          digest: 'sha256:1234',
          size: 2,
          data: 'e30=',
        },
        layers: [
          {
            mediaType: 'application/zstd',
            digest: 'sha256:zstfakearm64digest',
            size: 1233263850,
            annotations: {
              'org.opencontainers.image.title': 'podman-machine-daily.aarch64.applehv.raw.zst',
            },
          },
        ],
      });

    // now do the digests for blobs
    nock('https://quay.io')
      .get('/v2/podman/machine-os/blobs/sha256:zstfakeamd64digest')
      .reply(200, 'fake-amd64-content');

    const zstdArchiveFakeContent = 'blablabla-ARM64\n';
    nock('https://quay.io')
      .get('/v2/podman/machine-os/blobs/sha256:zstfakearm64digest')
      .reply(200, zstdArchiveFakeContent, {
        'content-type': 'application/octet-stream',
        'content-length': `${zstdArchiveFakeContent.length}`,
        'content-disposition': 'attachment; filename=binary.zip',
      });

    const fakeContent = 'blablabla-ARM64\n';

    const processArm64File = (): Buffer => {
      return Buffer.from(fakeContent);
    };

    nock('https://quay.io')
      .get('/v2/podman/machine-os/blobs/sha256:zstfakearm64digest')
      .reply(200, processArm64File(), {
        'content-type': 'application/octet-stream',
        'content-length': `${fakeContent.length}`,
        'content-disposition': 'attachment; filename=foo.raw.std',
      });

    const podman5DownloadMachineOS = new TestPodman5DownloadMachineOS('1.0-fake', shaCheck, '/fake-directory');

    vi.spyOn(podman5DownloadMachineOS, 'pipe').mockResolvedValue();

    await podman5DownloadMachineOS.download();
  });

  test('check pipe method', async () => {
    const podman5DownloadMachineOS = new TestPodman5DownloadMachineOS('1.0-fake', shaCheck, '/fake-directory');

    const myStream = Readable.from('Hello, World!');

    const readableStream = Readable.toWeb(myStream) as ReadableStream<Uint8Array>;

    const writeMock = vi.fn();
    const writableStream = new WritableStream({
      write: writeMock,
    });

    await podman5DownloadMachineOS.pipe('fake-title', 100, readableStream, writableStream);

    // check we wrote the content
    expect(writeMock).toHaveBeenCalledWith('Hello, World!', expect.anything());
  });
});
