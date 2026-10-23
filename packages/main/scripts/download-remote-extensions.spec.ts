/*********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
 ********************************************************************/

import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ImageRegistry } from '/@/plugin/image-registry.js';
import product from '/@product.json' with { type: 'json' };

import type { RemoteExtension } from './download-remote-extensions.js';
import {
  DIGEST_FILENAME,
  downloadExtension,
  EXTENSION_PLATFORMS_LABEL,
  findAuthEnvironment,
  getRemoteExtensionFromProductJSON,
  main,
  NAME_ARG,
  OCI_ARG,
  parseArgs,
  PLATFORM_ARG,
  REGISTRY_SECRET_ARG,
  REGISTRY_USER_ARG,
} from './download-remote-extensions.js';

// Mock process.exit to prevent test from exiting
vi.stubGlobal('process', { ...process, exit: vi.fn() });

vi.mock(import('node:fs/promises'));
vi.mock(import('node:fs'));
vi.mock(import('node:os'));
vi.mock(import('/@/plugin/image-registry.js'));
vi.mock(import('/@product.json'));

const TMP_DIR = 'tmp-dir';
const ABS_DEST_DIR = '/dest-dir';
const REMOTE_INFO_MOCK: RemoteExtension = {
  name: 'dummy-extension',
  oci: 'localhost/dummy-extension:latest',
};

const MANIFEST_MOCK = {
  config: {
    digest: 'sha256:00',
  },
};

const TMP_EXTENSION_DEST = join(TMP_DIR, REMOTE_INFO_MOCK.name);
const TMP_EXTENSION_PACKAGE_JSON = join(TMP_EXTENSION_DEST, 'extension', 'package.json');

const FINAL_EXTENSION_DEST = join(ABS_DEST_DIR, REMOTE_INFO_MOCK.name);
const FINAL_EXTENSION_DIGEST_FILE = join(FINAL_EXTENSION_DEST, DIGEST_FILENAME);

beforeEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();

  vi.mocked(tmpdir).mockReturnValue(TMP_DIR);
  vi.mocked(product).extensions = {
    remote: [],
    developmentDocumentation: '',
  };

  vi.mocked(ImageRegistry.prototype.getManifestFromImageName).mockResolvedValue(MANIFEST_MOCK);
  vi.mocked(ImageRegistry.prototype.getImageConfigLabels).mockResolvedValue({
    [EXTENSION_PLATFORMS_LABEL]: 'darwin/arm64,darwin/amd64,linux/amd64,linux/arm64,windows/amd64,windows/arm64',
  });
  vi.mocked(ImageRegistry.prototype.extractRegistryServerFromImage).mockReturnValue('quay.io');

  // mock final check to be valid
  vi.mocked(existsSync).mockImplementation(path => {
    switch (path) {
      case TMP_EXTENSION_PACKAGE_JSON:
        return true;
      default:
        return false;
    }
  });
});

describe('findAuthEnvironment', () => {
  test('should return undefined if none are defined', () => {
    const result = findAuthEnvironment('quay.io');
    expect(result).toBeUndefined();
  });

  test.each<{
    registry: string;
    env: {
      user: string;
      secret: string;
    };
  }>([
    {
      registry: 'quay.io',
      env: {
        user: 'AUTH_QUAY_IO_USER',
        secret: 'AUTH_QUAY_IO_SECRET',
      },
    },
    {
      registry: 'my-registry.example.io',
      env: {
        user: 'AUTH_MY_REGISTRY_EXAMPLE_IO_USER',
        secret: 'AUTH_MY_REGISTRY_EXAMPLE_IO_SECRET',
      },
    },
  ])('registry $registry should use $env.user & $env.secret', ({ registry, env }) => {
    vi.stubEnv(env.user, 'foo');
    vi.stubEnv(env.secret, 'bar');

    const result = findAuthEnvironment(registry);
    expect(result).toStrictEqual({
      username: 'foo',
      secret: 'bar',
    });
  });

  test('should fallback to REMOTE_EXTENSIONS_AUTH_USER and REMOTE_EXTENSIONS_AUTH_SECRET when registry-specific env vars are not set', () => {
    vi.stubEnv('REMOTE_EXTENSIONS_AUTH_USER', 'fallback-user');
    vi.stubEnv('REMOTE_EXTENSIONS_AUTH_SECRET', 'fallback-secret');

    const result = findAuthEnvironment('quay.io');
    expect(result).toStrictEqual({
      username: 'fallback-user',
      secret: 'fallback-secret',
    });
  });

  test('registry-specific env vars should take precedence over fallback env vars', () => {
    vi.stubEnv('AUTH_QUAY_IO_USER', 'specific-user');
    vi.stubEnv('AUTH_QUAY_IO_SECRET', 'specific-secret');
    vi.stubEnv('REMOTE_EXTENSIONS_AUTH_USER', 'fallback-user');
    vi.stubEnv('REMOTE_EXTENSIONS_AUTH_SECRET', 'fallback-secret');

    const result = findAuthEnvironment('quay.io');
    expect(result).toStrictEqual({
      username: 'specific-user',
      secret: 'specific-secret',
    });
  });

  test('should mix registry-specific user with fallback secret', () => {
    vi.stubEnv('AUTH_QUAY_IO_USER', 'specific-user');
    vi.stubEnv('REMOTE_EXTENSIONS_AUTH_SECRET', 'fallback-secret');

    const result = findAuthEnvironment('quay.io');
    expect(result).toStrictEqual({
      username: 'specific-user',
      secret: 'fallback-secret',
    });
  });

  test('should mix fallback user with registry-specific secret', () => {
    vi.stubEnv('REMOTE_EXTENSIONS_AUTH_USER', 'fallback-user');
    vi.stubEnv('AUTH_QUAY_IO_SECRET', 'specific-secret');

    const result = findAuthEnvironment('quay.io');
    expect(result).toStrictEqual({
      username: 'fallback-user',
      secret: 'specific-secret',
    });
  });

  test.each<string>(['AUTH_QUAY_IO_USER', 'AUTH_QUAY_IO_SECRET'])(
    'should throw an error if %s is the only env defined',
    env => {
      vi.stubEnv(env, 'foo');

      expect(() => {
        findAuthEnvironment('quay.io');
      }).toThrowError(
        'if one of AUTH_QUAY_IO_USER/REMOTE_EXTENSIONS_AUTH_USER and AUTH_QUAY_IO_SECRET/REMOTE_EXTENSIONS_AUTH_SECRET is specified, both need to be defined.',
      );
    },
  );

  test('should throw an error if only REMOTE_EXTENSIONS_AUTH_USER fallback is defined', () => {
    vi.stubEnv('REMOTE_EXTENSIONS_AUTH_USER', 'fallback-user');

    expect(() => {
      findAuthEnvironment('quay.io');
    }).toThrow(
      'if one of AUTH_QUAY_IO_USER/REMOTE_EXTENSIONS_AUTH_USER and AUTH_QUAY_IO_SECRET/REMOTE_EXTENSIONS_AUTH_SECRET is specified, both need to be defined.',
    );
  });

  test('should throw an error if only REMOTE_EXTENSIONS_AUTH_SECRET fallback is defined', () => {
    vi.stubEnv('REMOTE_EXTENSIONS_AUTH_SECRET', 'fallback-secret');

    expect(() => {
      findAuthEnvironment('quay.io');
    }).toThrow(
      'if one of AUTH_QUAY_IO_USER/REMOTE_EXTENSIONS_AUTH_USER and AUTH_QUAY_IO_SECRET/REMOTE_EXTENSIONS_AUTH_SECRET is specified, both need to be defined.',
    );
  });
});

describe('downloadExtension', () => {
  test('should call ImageRegistry#downloadAndExtractImage with appropriate argument', async () => {
    await downloadExtension({
      destination: ABS_DEST_DIR,
      extension: REMOTE_INFO_MOCK,
    });

    expect(ImageRegistry.prototype.downloadAndExtractImage).toHaveBeenCalledExactlyOnceWith(
      REMOTE_INFO_MOCK.oci,
      expect.stringContaining(TMP_DIR),
      expect.any(Function),
    );
  });

  test('cache hit should not re-download', async () => {
    // mock cache hit
    vi.mocked(readFile).mockResolvedValue(MANIFEST_MOCK.config.digest);

    // mock final check to be valid
    vi.mocked(existsSync).mockImplementation(path => {
      switch (path) {
        case FINAL_EXTENSION_DEST: // mock  the final destination folder already exists
          return true;
        default:
          return false;
      }
    });

    await downloadExtension({
      destination: ABS_DEST_DIR,
      extension: REMOTE_INFO_MOCK,
    });

    // ensure we read the digest file
    expect(readFile).toHaveBeenCalledExactlyOnceWith(FINAL_EXTENSION_DIGEST_FILE, {
      encoding: 'utf-8',
    });
    // ensure we did not call ImageRegistry#downloadAndExtractImage
    expect(ImageRegistry.prototype.downloadAndExtractImage).not.toHaveBeenCalled();
  });

  test('different digest should rm & download OCI', async () => {
    // mock cache hit
    vi.mocked(readFile).mockResolvedValue('sha256:01');

    // mock final check to be valid
    vi.mocked(existsSync).mockImplementation(path => {
      switch (path) {
        case TMP_EXTENSION_PACKAGE_JSON: // mock the tmp extension package.json already exists
        case FINAL_EXTENSION_DEST: // mock the final destination folder already exists
          return true;
        default:
          return false;
      }
    });

    await downloadExtension({
      destination: ABS_DEST_DIR,
      extension: REMOTE_INFO_MOCK,
    });

    // ensure we read the digest file
    expect(readFile).toHaveBeenCalledOnce();

    // ensure we rm the final destination
    expect(rm).toHaveBeenCalledExactlyOnceWith(FINAL_EXTENSION_DEST, {
      recursive: true,
    });

    // ensure we did call ImageRegistry#downloadAndExtractImage
    expect(ImageRegistry.prototype.downloadAndExtractImage).toHaveBeenCalled();
  });

  test('should rename tmp directory to destination', async () => {
    await downloadExtension({
      destination: ABS_DEST_DIR,
      extension: REMOTE_INFO_MOCK,
    });

    expect(rename).toHaveBeenCalledExactlyOnceWith(
      join(TMP_DIR, REMOTE_INFO_MOCK.name, 'extension'),
      join(ABS_DEST_DIR, REMOTE_INFO_MOCK.name),
    );

    expect(cp).not.toHaveBeenCalled();
    expect(rm).not.toHaveBeenCalled();
  });

  test('invalid OCI registry name with auth should throw an error', async () => {
    vi.mocked(ImageRegistry.prototype.extractRegistryServerFromImage).mockReturnValue(undefined);

    await expect(async () => {
      await downloadExtension({
        destination: ABS_DEST_DIR,
        extension: REMOTE_INFO_MOCK,
        auth: {
          username: 'foo',
          secret: 'bar',
        },
      });
    }).rejects.toThrowError(`cannot determine registry for image ${REMOTE_INFO_MOCK.oci}`);
  });

  test('should register registry', async () => {
    await downloadExtension({
      destination: ABS_DEST_DIR,
      extension: REMOTE_INFO_MOCK,
      auth: {
        username: 'foo',
        secret: 'bar',
      },
    });
    expect(ImageRegistry.prototype.registerRegistry).toHaveBeenCalledExactlyOnceWith({
      source: 'scripts',
      serverUrl: 'quay.io',
      username: 'foo',
      secret: 'bar',
    });
  });

  test('should write digest file to destination', async () => {
    await downloadExtension({
      destination: ABS_DEST_DIR,
      extension: REMOTE_INFO_MOCK,
    });

    expect(writeFile).toHaveBeenCalledExactlyOnceWith(FINAL_EXTENSION_DIGEST_FILE, MANIFEST_MOCK.config.digest, {
      encoding: 'utf-8',
    });
  });

  test('if rename throw ErrnoException', async () => {
    vi.mocked(rename).mockRejectedValue({
      code: 'EXDEV',
    } as NodeJS.ErrnoException);

    await downloadExtension({
      destination: ABS_DEST_DIR,
      extension: REMOTE_INFO_MOCK,
    });

    const tmpFolder = join(TMP_DIR, REMOTE_INFO_MOCK.name, 'extension');

    expect(rename).toHaveBeenCalledOnce();
    expect(cp).toHaveBeenCalledExactlyOnceWith(tmpFolder, join(ABS_DEST_DIR, REMOTE_INFO_MOCK.name), {
      recursive: true,
    });
    expect(rm).toHaveBeenCalledExactlyOnceWith(tmpFolder, {
      recursive: true,
    });
  });

  test('should mkdir the destination directory', async () => {
    await downloadExtension({
      destination: ABS_DEST_DIR,
      extension: REMOTE_INFO_MOCK,
    });

    expect(mkdir).toHaveBeenCalledExactlyOnceWith(ABS_DEST_DIR, {
      recursive: true,
    });
  });

  test('extracted content without package.json should throw an error', async () => {
    // mock existsSync for path ending with 'package.json' should return false
    vi.mocked(existsSync).mockImplementation(path => {
      return !String(path).endsWith('package.json');
    });

    await expect(async () => {
      await downloadExtension({
        destination: ABS_DEST_DIR,
        extension: REMOTE_INFO_MOCK,
      });
    }).rejects.toThrowError(
      `extension ${REMOTE_INFO_MOCK.name} has malformed content: the OCI image should contains a "package.json" file in the extension folder`,
    );
  });
});

describe('parseArgs', () => {
  test.each<{
    name: string;
    args: unknown[];
    error: string;
  }>([
    {
      name: 'missing --output should throw an error',
      args: [],
      error: 'missing output argument',
    },
    {
      name: 'non absolute --output should throw an error',
      args: ['--output', './foo'],
      error: 'the output should be an absolute directory',
    },
    {
      name: 'invalid --platform should throw an error',
      args: ['--output', ABS_DEST_DIR, `--${PLATFORM_ARG}`, 'darwin'],
      error: 'when specifying --platform, use comma-separated os/architecture values',
    },
    {
      name: 'multiple --platform values should throw an error',
      args: ['--output', ABS_DEST_DIR, `--${PLATFORM_ARG}`, 'linux/arm64', `--${PLATFORM_ARG}`, 'linux/amd64'],
      error: 'when specifying --platform, only one is allowed',
    },
    {
      name: 'invalid platform list should throw an error',
      args: ['--output', ABS_DEST_DIR, `--${PLATFORM_ARG}`, 'linux/arm64,darwin'],
      error: 'when specifying --platform, use comma-separated os/architecture values',
    },
    // missing one arg
    {
      name: `having --${NAME_ARG} without --${OCI_ARG} should throw an error`,
      args: ['--output', ABS_DEST_DIR, `--${NAME_ARG}`, 'foo'],
      error: `when specifying --${OCI_ARG} or --${NAME_ARG}, both should be provided as valid string`,
    },
    {
      name: `having --${OCI_ARG} without --${NAME_ARG} should throw an error`,
      args: ['--output', ABS_DEST_DIR, `--${OCI_ARG}`, 'ghcr.io/org/my-user:latest'],
      error: `when specifying --${OCI_ARG} or --${NAME_ARG}, both should be provided as valid string`,
    },
    {
      name: `having --${REGISTRY_USER_ARG} without --${REGISTRY_SECRET_ARG} should throw an error`,
      args: ['--output', ABS_DEST_DIR, `--${REGISTRY_USER_ARG}`, 'foo'],
      error: `when specifying --${REGISTRY_USER_ARG} or --${REGISTRY_SECRET_ARG}, both should be provided as valid string`,
    },
    {
      name: `having --${REGISTRY_SECRET_ARG} without --${REGISTRY_USER_ARG} should throw an error`,
      args: ['--output', ABS_DEST_DIR, `--${REGISTRY_SECRET_ARG}`, 'dummy-secret'],
      error: `when specifying --${REGISTRY_USER_ARG} or --${REGISTRY_SECRET_ARG}, both should be provided as valid string`,
    },
    // zero length args
    {
      name: `zero length --${NAME_ARG} should throw an error`,
      args: ['--output', ABS_DEST_DIR, `--${NAME_ARG}`, '', `--${OCI_ARG}`, 'ghcr.io/org/foo:latest'],
      error: `when specifying --${OCI_ARG} or --${NAME_ARG}, both should be provided as valid string`,
    },
    {
      name: `zero length --${OCI_ARG} should throw an error`,
      args: ['--output', ABS_DEST_DIR, `--${OCI_ARG}`, '', `--${NAME_ARG}`, 'foo'],
      error: `when specifying --${OCI_ARG} or --${NAME_ARG}, both should be provided as valid string`,
    },
    {
      name: `zero length --${REGISTRY_USER_ARG} should throw an error`,
      args: ['--output', ABS_DEST_DIR, `--${REGISTRY_USER_ARG}`, '', `--${REGISTRY_SECRET_ARG}`, 'dummy-secret'],
      error: `when specifying --${REGISTRY_USER_ARG} or --${REGISTRY_SECRET_ARG}, both should be provided as valid string`,
    },
    {
      name: `zero length --${REGISTRY_SECRET_ARG} should throw an error`,
      args: ['--output', ABS_DEST_DIR, `--${REGISTRY_USER_ARG}`, 'foo', `--${REGISTRY_SECRET_ARG}`, ''],
      error: `when specifying --${REGISTRY_USER_ARG} or --${REGISTRY_SECRET_ARG}, both should be provided as valid string`,
    },
    // too many args
    {
      name: `multiple --${OCI_ARG} should throw an error`,
      args: [
        '--output',
        ABS_DEST_DIR,
        `--${OCI_ARG}`,
        'ghcr.io/org/foo:latest',
        `--${OCI_ARG}`,
        'ghcr.io/org/bar:latest',
        `--${NAME_ARG}`,
        'foo',
      ],
      error: `when specifying --${OCI_ARG} and --${NAME_ARG}, only one is allowed`,
    },
    {
      name: `multiple --${NAME_ARG} should throw an error`,
      args: [
        '--output',
        ABS_DEST_DIR,
        `--${OCI_ARG}`,
        'ghcr.io/org/foo:latest',
        `--${NAME_ARG}`,
        'foo',
        `--${NAME_ARG}`,
        'bar',
      ],
      error: `when specifying --${OCI_ARG} and --${NAME_ARG}, only one is allowed`,
    },
    {
      name: `multiple --${REGISTRY_USER_ARG} should throw an error`,
      args: [
        '--output',
        ABS_DEST_DIR,
        `--${REGISTRY_USER_ARG}`,
        'user-1',
        `--${REGISTRY_USER_ARG}`,
        'user-2',
        `--${REGISTRY_SECRET_ARG}`,
        'secret',
      ],
      error: `when specifying --${REGISTRY_USER_ARG} and --${REGISTRY_SECRET_ARG}, only one is allowed`,
    },
    {
      name: `multiple --${REGISTRY_SECRET_ARG} should throw an error`,
      args: [
        '--output',
        ABS_DEST_DIR,
        `--${REGISTRY_SECRET_ARG}`,
        'secret-1',
        `--${REGISTRY_SECRET_ARG}`,
        'secret-2',
        `--${REGISTRY_USER_ARG}`,
        'foo',
      ],
      error: `when specifying --${REGISTRY_USER_ARG} and --${REGISTRY_SECRET_ARG}, only one is allowed`,
    },
    // wrong type args
    {
      name: `boolean --${NAME_ARG} should throw an error`,
      args: ['--output', ABS_DEST_DIR, `--${NAME_ARG}`, true, `--${OCI_ARG}`, 'ghcr.io/org/foo:latest'],
      error: `when specifying --${OCI_ARG} and --${NAME_ARG}, should be valid strings`,
    },
    {
      name: `boolean --${OCI_ARG} should throw an error`,
      args: ['--output', ABS_DEST_DIR, `--${NAME_ARG}`, 'foo', `--${OCI_ARG}`, true],
      error: `when specifying --${OCI_ARG} and --${NAME_ARG}, should be valid strings`,
    },
  ])('$name', ({ args, error }) => {
    expect(() => {
      parseArgs(args as string[]);
    }).toThrowError(error);
  });

  test(`should handle no --${NAME_ARG} & --${OCI_ARG} args`, () => {
    expect(parseArgs(['--output', ABS_DEST_DIR])).toStrictEqual(
      expect.objectContaining({
        output: ABS_DEST_DIR,
      }),
    );
  });

  test('should parse a comma-separated platform list', () => {
    expect(parseArgs(['--output', ABS_DEST_DIR, `--${PLATFORM_ARG}`, 'darwin/amd64,darwin/arm64'])).toStrictEqual(
      expect.objectContaining({
        platforms: ['darwin/amd64', 'darwin/arm64'],
      }),
    );
  });

  test('should handle single string value for --oci arg', () => {
    expect(
      parseArgs([
        // output arg
        '--output',
        ABS_DEST_DIR,
        // oci arg
        `--${OCI_ARG}`,
        'ghcr.io/org/my-user:latest',
        // name arg
        `--${NAME_ARG}`,
        'my-user',
      ]),
    ).toStrictEqual(
      expect.objectContaining({
        output: ABS_DEST_DIR,
        extension: {
          oci: 'ghcr.io/org/my-user:latest',
          name: 'my-user',
        },
      }),
    );
  });

  test(`should parse --${REGISTRY_USER_ARG} & --${REGISTRY_SECRET_ARG} args`, () => {
    expect(
      parseArgs(['--output', ABS_DEST_DIR, `--${REGISTRY_USER_ARG}`, 'foo', `--${REGISTRY_SECRET_ARG}`, 'bar']),
    ).toStrictEqual(
      expect.objectContaining({
        auth: {
          username: 'foo',
          secret: 'bar',
        },
      }),
    );
  });
});

describe('getRemoteExtensionFromProductJSON', () => {
  test('expect to read product.json#extensions#remote', () => {
    (vi.mocked(product).extensions.remote as RemoteExtension[]) = [REMOTE_INFO_MOCK];

    expect(getRemoteExtensionFromProductJSON()).toStrictEqual([REMOTE_INFO_MOCK]);
  });

  test('malformed extensions in product.json should throw an error', () => {
    (vi.mocked(product).extensions as unknown) = undefined;

    expect(() => {
      getRemoteExtensionFromProductJSON();
    }).toThrowError('malformed product.json: extensions property is not an object');
  });

  test('array for extension property should throw an error', () => {
    (vi.mocked(product).extensions as unknown) = [];

    expect(() => {
      getRemoteExtensionFromProductJSON();
    }).toThrowError('malformed product.json: object extensions do not have a valid remote array');
  });

  test('non-array for extension.remote should throw an error', () => {
    (vi.mocked(product).extensions.remote as unknown) = {};

    expect(() => {
      getRemoteExtensionFromProductJSON();
    }).toThrowError('malformed product.json: object extensions do not have a valid remote array');
  });

  test('empty array in extensions.remote should return itself', () => {
    vi.mocked(product).extensions.remote = [];

    expect(getRemoteExtensionFromProductJSON()).toHaveLength(0);
  });

  test('missing oci property in an item in extension.remote should throw an error', () => {
    (vi.mocked(product).extensions.remote as RemoteExtension[]) = [
      {
        occci: '',
        name: 'foo',
      } as unknown as RemoteExtension,
    ];

    expect(() => {
      getRemoteExtensionFromProductJSON();
    }).toThrowError('malformed product.json: extension at index 0 must have oci property as a valid string');
  });

  test('missing name property in an item in extension.remote should throw an error', () => {
    (vi.mocked(product).extensions.remote as RemoteExtension[]) = [
      {
        oci: 'foo',
        Name: 'bar',
      } as unknown as RemoteExtension,
    ];

    expect(() => {
      getRemoteExtensionFromProductJSON();
    }).toThrowError('malformed product.json: extension at index 0 must have name property as a valid string');
  });

  test('undefined item in extension.remote should throw an error', () => {
    (vi.mocked(product).extensions.remote as RemoteExtension[]) = [undefined as unknown as RemoteExtension];

    expect(() => {
      getRemoteExtensionFromProductJSON();
    }).toThrowError('malformed product.json: extension at index 0 is invalid');
  });
});

describe('main', () => {
  test(`cli args should be preferred to product.json`, async () => {
    (vi.mocked(product).extensions.remote as RemoteExtension[]) = [REMOTE_INFO_MOCK];

    await main([
      '--output',
      ABS_DEST_DIR,
      `--${OCI_ARG}`,
      'localhost/dummy-extension:latest',
      `--${NAME_ARG}`,
      'dummy-extension',
    ]);

    expect(rename).toHaveBeenCalledExactlyOnceWith(
      join(TMP_DIR, 'dummy-extension', 'extension'),
      join(ABS_DEST_DIR, 'dummy-extension'),
    );
  });

  test('empty remoteExtensions in product.json should not call any ImageRegistry#downloadAndExtractImage', async () => {
    expect(ImageRegistry.prototype.downloadAndExtractImage).not.toHaveBeenCalled();

    await main(['--output', ABS_DEST_DIR]);

    expect(ImageRegistry.prototype.downloadAndExtractImage).not.toHaveBeenCalled();
  });

  test('--output argument should be used as destination', async () => {
    (vi.mocked(product).extensions.remote as RemoteExtension[]) = [REMOTE_INFO_MOCK];

    await main(['--output', ABS_DEST_DIR, `--${PLATFORM_ARG}`, 'linux/amd64']);

    expect(rename).toHaveBeenCalledExactlyOnceWith(
      join(TMP_DIR, REMOTE_INFO_MOCK.name, 'extension'),
      join(ABS_DEST_DIR, REMOTE_INFO_MOCK.name),
    );
  });

  test('universal platform list includes an extension supported on either architecture', async () => {
    (vi.mocked(product).extensions.remote as RemoteExtension[]) = [REMOTE_INFO_MOCK];

    await main(['--output', ABS_DEST_DIR, `--${PLATFORM_ARG}`, 'darwin/amd64,darwin/arm64']);

    expect(ImageRegistry.prototype.getImageConfigLabels).toHaveBeenCalledExactlyOnceWith(REMOTE_INFO_MOCK.oci);
    expect(ImageRegistry.prototype.getManifestFromImageName).toHaveBeenCalledExactlyOnceWith(REMOTE_INFO_MOCK.oci);
    expect(ImageRegistry.prototype.downloadAndExtractImage).toHaveBeenCalledExactlyOnceWith(
      REMOTE_INFO_MOCK.oci,
      expect.stringContaining(TMP_DIR),
      expect.any(Function),
    );
  });

  test('includes an extension without a support label to preserve existing behavior', async () => {
    (vi.mocked(product).extensions.remote as RemoteExtension[]) = [REMOTE_INFO_MOCK];
    vi.mocked(ImageRegistry.prototype.getImageConfigLabels).mockResolvedValueOnce({});

    await main(['--output', ABS_DEST_DIR, `--${PLATFORM_ARG}`, 'darwin/amd64']);

    expect(ImageRegistry.prototype.getManifestFromImageName).toHaveBeenCalledExactlyOnceWith(REMOTE_INFO_MOCK.oci);
    expect(ImageRegistry.prototype.downloadAndExtractImage).toHaveBeenCalledExactlyOnceWith(
      REMOTE_INFO_MOCK.oci,
      expect.stringContaining(TMP_DIR),
      expect.any(Function),
    );
  });

  test('skips an extension with unsupported runtime platforms before pulling layers', async () => {
    (vi.mocked(product).extensions.remote as RemoteExtension[]) = [REMOTE_INFO_MOCK];
    vi.mocked(ImageRegistry.prototype.getImageConfigLabels).mockResolvedValueOnce({
      [EXTENSION_PLATFORMS_LABEL]: 'darwin/arm64',
    });

    await main(['--output', ABS_DEST_DIR, `--${PLATFORM_ARG}`, 'darwin/amd64']);

    expect(ImageRegistry.prototype.getManifestFromImageName).not.toHaveBeenCalled();
    expect(ImageRegistry.prototype.downloadAndExtractImage).not.toHaveBeenCalled();
  });

  test('rejects a malformed platform label before pulling layers', async () => {
    (vi.mocked(product).extensions.remote as RemoteExtension[]) = [REMOTE_INFO_MOCK];
    vi.mocked(ImageRegistry.prototype.getImageConfigLabels).mockResolvedValueOnce({
      [EXTENSION_PLATFORMS_LABEL]: 'darwin/arm64,foo',
    });

    await main(['--output', ABS_DEST_DIR, `--${PLATFORM_ARG}`, 'darwin/arm64']);

    expect(process.exit).toHaveBeenCalledWith(1);
    expect(ImageRegistry.prototype.getManifestFromImageName).not.toHaveBeenCalled();
    expect(ImageRegistry.prototype.downloadAndExtractImage).not.toHaveBeenCalled();
  });

  test('applies platform filtering to a single CLI extension', async () => {
    await main([
      '--output',
      ABS_DEST_DIR,
      `--${OCI_ARG}`,
      REMOTE_INFO_MOCK.oci,
      `--${NAME_ARG}`,
      REMOTE_INFO_MOCK.name,
      `--${PLATFORM_ARG}`,
      'linux/amd64',
    ]);

    expect(ImageRegistry.prototype.getImageConfigLabels).toHaveBeenCalledExactlyOnceWith(REMOTE_INFO_MOCK.oci);
    expect(ImageRegistry.prototype.getManifestFromImageName).toHaveBeenCalledExactlyOnceWith(REMOTE_INFO_MOCK.oci);
    expect(ImageRegistry.prototype.downloadAndExtractImage).toHaveBeenCalledExactlyOnceWith(
      REMOTE_INFO_MOCK.oci,
      expect.stringContaining(TMP_DIR),
      expect.any(Function),
    );
  });

  test('should call process.exit(1) when product.json extension download fails', async () => {
    const downloadError = new Error('Unable to get access');
    vi.mocked(ImageRegistry.prototype.downloadAndExtractImage).mockRejectedValue(downloadError);
    (vi.mocked(product).extensions.remote as RemoteExtension[]) = [REMOTE_INFO_MOCK];

    await main(['--output', ABS_DEST_DIR, `--${PLATFORM_ARG}`, 'linux/amd64']);

    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
