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

import { setupServer, SetupServerApi } from 'msw/node';
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';
import { DiskType, DownloadAndCheck, Podman5DownloadMachineOS, PodmanDownload, ShaCheck } from './podman-download';
import * as podman5JSON from '../src/podman5.json';
import { Readable, Writable } from 'node:stream';
import { WritableStream } from 'stream/web';
import { http, HttpResponse } from 'msw';
import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { Octokit } from 'octokit';

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
  public getPodman5DownloadMachineOS(): Podman5DownloadMachineOS {
    return super.getPodman5DownloadMachineOS();
  }

  public getArtifactsToDownload(): {
    version: string;
    downloadName: string;
    artifactName: string;
  }[] {
    return super.getArtifactsToDownload();
  }

  public getDownloadAndCheck(): DownloadAndCheck {
    return super.getDownloadAndCheck();
  }

  public getShaCheck(): ShaCheck {
    return super.getShaCheck();
  }
}

let server: SetupServerApi | undefined = undefined;

afterEach(() => {
  server?.close();
});

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

    // mock podman5DownloadMachineOS
    const podman5DownloadMachineOS = podmanDownload.getPodman5DownloadMachineOS();
    const podman5DownloadMachineOSSpy = vi.spyOn(podman5DownloadMachineOS, 'download');
    podman5DownloadMachineOSSpy.mockResolvedValue();

    // add env file
    process.env.AIRGAP_DOWNLOAD = 'yes';

    await podmanDownload.downloadBinaries();

    // check called with the correct parameters
    const artifactsToDownload = podmanDownload.getArtifactsToDownload();
    artifactsToDownload.forEach(artifact => {
      expect(artifact.version).toContain('v5.');
      expect(artifact.artifactName).toContain('-setup.exe');
      expect(artifact.downloadName).toContain('-setup.exe');
    });
  });

  test('PodmanDownload with mocked json', async () => {
    const podmanDownload = new TestPodmanDownload(mockedPodman5, true);

    // mock downloadAndCheckSha
    const downloadCheck = podmanDownload.getDownloadAndCheck();
    const downloadAndCheckShaSpy = vi.spyOn(downloadCheck, 'downloadAndCheckSha');
    downloadAndCheckShaSpy.mockResolvedValue();

    const podman5DownloadMachineOS = podmanDownload.getPodman5DownloadMachineOS();
    const podman5DownloadMachineOSSpy = vi.spyOn(podman5DownloadMachineOS, 'download');
    podman5DownloadMachineOSSpy.mockResolvedValue();

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
    expect(podman5DownloadMachineOSSpy).not.toHaveBeenCalled();

    // check called with the correct parameters
    const artifactsToDownload = podmanDownload.getArtifactsToDownload();
    artifactsToDownload.forEach(artifact => {
      expect(artifact.version).toContain('v5.0.0');
      expect(artifact.artifactName).toBe('podman-5.0.0-setup.exe');
      expect(artifact.downloadName).toBe('podman-5.0.0-setup.exe');
    });
  });
});

describe('DownloadAndCheckSha', () => {
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
    const shasumContent = 'fake-sha podman-fake-binary\n';
    const podmanBinaryContent = 'fake-binary-content';

    const handlers = [
      http.get('https://api.github.com/repos/containers/podman/releases/tags/vFakeVersion', () =>
        HttpResponse.json(response),
      ),

      http.get(
        'https://api.github.com/repos/containers/podman/releases/assets/789',
        () =>
          new HttpResponse(shasumContent, {
            status: 200,
            headers: {
              'content-type': 'application/octet-stream',
              'content-length': `${shasumContent.length}`,
              'content-disposition': 'attachment; filename=binary.zip',
            },
          }),
      ),

      // podman-binary content
      http.get(
        'https://api.github.com/repos/containers/podman/releases/assets/456',
        () =>
          new HttpResponse(podmanBinaryContent, {
            status: 200,
            headers: {
              'content-type': 'application/octet-stream',
              'content-length': `${podmanBinaryContent.length}`,
              'content-disposition': 'attachment; filename=binary.zip',
            },
          }),
      ),
    ];

    server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'error' });

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

  test('download all the files and perform checks on Mac', async () => {
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

    const zstdArchiveFakeContent = 'blablabla-ARM64\n';
    const fakeContent = 'blablabla-ARM64\n';

    const processArm64File = (): Buffer => {
      return Buffer.from(fakeContent);
    };

    const handlers = [
      http.get('https://quay.io/v2/podman/machine-os/manifests/1.0-fake', () => HttpResponse.json(rootManifest)),

      // fake digest for amd64
      http.get('https://quay.io/v2/podman/machine-os/manifests/sha256:123amd64', () =>
        HttpResponse.json({
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
        }),
      ),

      // fake digest for arm64
      http.get('https://quay.io/v2/podman/machine-os/manifests/sha256:456arm64', () =>
        HttpResponse.json({
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
        }),
      ),

      // now do the digests for blobs
      http.get('https://quay.io/v2/podman/machine-os/blobs/sha256:zstfakeamd64digest', () =>
        HttpResponse.text('fake-amd64-content'),
      ),

      http.get(
        'https://quay.io/v2/podman/machine-os/blobs/sha256:zstfakearm64digest',
        () =>
          new HttpResponse(zstdArchiveFakeContent, {
            headers: {
              'content-type': 'application/octet-stream',
              'content-length': `${zstdArchiveFakeContent.length}`,
              'content-disposition': 'attachment; filename=binary.zip',
            },
          }),
      ),

      http.get(
        'https://quay.io/v2/podman/machine-os/blobs/sha256:zstfakearm64digest',
        () =>
          new HttpResponse(processArm64File(), {
            headers: {
              'content-type': 'application/octet-stream',
              'content-length': `${fakeContent.length}`,
              'content-disposition': 'attachment; filename=foo.raw.std',
            },
          }),
      ),
    ];

    server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'error' });

    const podman5DownloadMachineOS = new TestPodman5DownloadMachineOS('1.0-fake', shaCheck, '/fake-directory');

    vi.spyOn(podman5DownloadMachineOS, 'pipe').mockResolvedValue();

    await podman5DownloadMachineOS.setAndDownload('darwin');
  });

  test('download all the files and perform checks on Windows', async () => {
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
            disktype: 'wsl',
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
            disktype: 'wsl',
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
            architecture: 'x86_64',
            os: 'linux',
          },
        },
      ],
    };

    const zstdArchiveFakeContent = 'blablabla-ARM64\n';
    const fakeContent = 'blablabla-ARM64\n';

    const processArm64File = (): Buffer => {
      return Buffer.from(fakeContent);
    };

    const handlers = [
      http.get('https://quay.io/v2/podman/machine-os-wsl/manifests/1.0-fake', () => HttpResponse.json(rootManifest)),

      // fake digest for amd64
      http.get('https://quay.io/v2/podman/machine-os-wsl/manifests/sha256:123amd64', () =>
        HttpResponse.json({
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
                'org.opencontainers.image.title': 'podman-machine-daily.amd64.wsl.raw.zst',
              },
            },
          ],
        }),
      ),

      // fake digest for arm64
      http.get('https://quay.io/v2/podman/machine-os-wsl/manifests/sha256:456arm64', () =>
        HttpResponse.json({
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
                'org.opencontainers.image.title': 'podman-machine-daily.aarch64.wsl.raw.zst',
              },
            },
          ],
        }),
      ),

      // now do the digests for blobs
      http.get('https://quay.io/v2/podman/machine-os-wsl/blobs/sha256:zstfakeamd64digest', () =>
        HttpResponse.text('fake-amd64-content'),
      ),

      http.get(
        'https://quay.io/v2/podman/machine-os-wsl/blobs/sha256:zstfakearm64digest',
        () =>
          new HttpResponse(zstdArchiveFakeContent, {
            headers: {
              'content-type': 'application/octet-stream',
              'content-length': `${zstdArchiveFakeContent.length}`,
              'content-disposition': 'attachment; filename=binary.zip',
            },
          }),
      ),

      http.get(
        'https://quay.io/v2/podman/machine-os-wsl/blobs/sha256:zstfakearm64digest',
        () =>
          new HttpResponse(processArm64File(), {
            headers: {
              'content-type': 'application/octet-stream',
              'content-length': `${fakeContent.length}`,
              'content-disposition': 'attachment; filename=foo.raw.std',
            },
          }),
      ),
    ];

    server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'error' });

    const podman5DownloadMachineOS = new TestPodman5DownloadMachineOS('1.0-fake', shaCheck, '/fake-directory');

    vi.spyOn(podman5DownloadMachineOS, 'pipe').mockResolvedValue();

    await podman5DownloadMachineOS.setAndDownload('win32');
  });

  test('check pipe method on Mac', async () => {
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

  test('check pipe method on Windows', async () => {
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
