/**********************************************************************
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
 ***********************************************************************/

import type { Dirent } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';

import type { TelemetryLogger } from '@podman-desktop/api';
import { env } from '@podman-desktop/api';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { type CertificateDetectionConfig, CertificateDetectionService } from './certificate-detection-service';

vi.mock(import('node:fs/promises'));
vi.mock(import('node:os'));

const SYSTEM_CERTS_DIR = '/etc/containers/certs.d';

const mockTelemetryLogger: TelemetryLogger = {
  logUsage: vi.fn(),
  logError: vi.fn(),
  onDidChangeEnableStates: vi.fn(),
  isUsageEnabled: true,
  isErrorsEnabled: true,
  dispose: vi.fn(),
};

function createMockDirent(overrides: Partial<Dirent>): Dirent {
  return {
    isBlockDevice: (): boolean => false,
    isCharacterDevice: (): boolean => false,
    isFIFO: (): boolean => false,
    isSocket: (): boolean => false,
    isDirectory: (): boolean => false,
    isFile: (): boolean => false,
    isSymbolicLink: (): boolean => false,
    name: '',
    parentPath: '',
    ...overrides,
  };
}

describe('CertificateDetectionService', () => {
  let serviceWithTelemetry: CertificateDetectionService;

  const createMockFileSystemWithCerts = (
    registryName: string,
    certFiles: Dirent[],
    baseDir = SYSTEM_CERTS_DIR,
  ): void => {
    const mockDirent = createMockDirent({
      name: registryName,
      isDirectory: (): boolean => true,
      parentPath: baseDir,
    });

    vi.mocked(fs.access).mockResolvedValue();
    vi.mocked(fs.readdir).mockImplementation((async (dirPath: unknown, _options?: unknown) => {
      const pathStr = String(dirPath);
      if (pathStr === baseDir) {
        return [mockDirent];
      }
      if (pathStr.includes(registryName)) {
        return certFiles;
      }
      return [];
    }) as typeof fs.readdir);
  };

  const mockOneCertificate = (baseDir = SYSTEM_CERTS_DIR, registryName = 'registry.example.com'): void => {
    createMockFileSystemWithCerts(
      registryName,
      [
        createMockDirent({
          name: 'ca.crt',
          isFile: (): boolean => true,
          parentPath: `${baseDir}/${registryName}`,
        }),
      ],
      baseDir,
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(env).isWindows = false;
    vi.mocked(env).isMac = false;
    vi.mocked(env).isLinux = false;
    vi.mocked(os.homedir).mockReturnValue('/home/user');
    serviceWithTelemetry = new CertificateDetectionService(mockTelemetryLogger);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    test('should create service with default config when no config provided', () => {
      const serviceWithDefaults = new CertificateDetectionService();
      expect(serviceWithDefaults).toBeDefined();
    });

    test('should create service with telemetry logger', () => {
      expect(serviceWithTelemetry).toBeDefined();
    });

    test('should merge provided config with defaults', () => {
      const customConfig: Partial<CertificateDetectionConfig> = {
        scanTimeoutMs: 5000,
        validCertExtensions: ['.crt'],
      };
      const serviceWithConfig = new CertificateDetectionService(undefined, customConfig);
      expect(serviceWithConfig).toBeDefined();
    });
  });

  describe('detectCustomCertificates', () => {
    test('should return minimal result when telemetry is disabled', async () => {
      const noTelemetryConfig: Partial<CertificateDetectionConfig> = {
        enableTelemetry: false,
      };
      const serviceWithoutTelemetry = new CertificateDetectionService(undefined, noTelemetryConfig);

      const result = await serviceWithoutTelemetry.detectCustomCertificates();

      expect(result).toMatchObject({
        hasCustomCertificates: false,
        certificateCount: 0,
        scanDurationMs: 0,
      });
      // Verify no filesystem operations were performed
      expect(fs.access).not.toHaveBeenCalled();
      expect(fs.readdir).not.toHaveBeenCalled();
    });

    test('should return result with no certificates when directories do not exist and telemetry enabled', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const result = await serviceWithTelemetry.detectCustomCertificates();

      expect(result).toMatchObject({
        hasCustomCertificates: false,
        certificateCount: 0,
        scanDurationMs: expect.any(Number),
        errors: [],
      });
    });

    test('should detect certificates in system directory with telemetry enabled', async () => {
      const mockDirent = createMockDirent({
        name: 'registry.example.com',
        isDirectory: (): boolean => true,
        parentPath: '/etc/containers/certs.d',
      });
      const mockCertFile = createMockDirent({
        name: 'ca.crt',
        isFile: (): boolean => true,
        parentPath: '/etc/containers/certs.d/registry.example.com',
      });

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockImplementation((async (dirPath: unknown, _options?: unknown) => {
        const pathStr = String(dirPath);
        if (pathStr === '/etc/containers/certs.d') {
          return [mockDirent];
        }
        if (pathStr.includes('.config/containers/certs.d')) {
          return [];
        }
        if (pathStr.includes('registry.example.com')) {
          return [mockCertFile];
        }
        return [];
      }) as typeof fs.readdir);

      const result = await serviceWithTelemetry.detectCustomCertificates();

      expect(result).toMatchObject({
        hasCustomCertificates: true,
        certificateCount: 1,
        scanDurationMs: expect.any(Number),
        errors: [],
      });
    });

    test('should detect certificates in user directory with telemetry enabled', async () => {
      // Override service config to only scan user directories
      const customConfig: Partial<CertificateDetectionConfig> = {
        certDirectories: {
          system: [],
          user: ['$HOME/.config/containers/certs.d'],
        },
      };
      const customService = new CertificateDetectionService(mockTelemetryLogger, customConfig);

      const mockDirent = createMockDirent({
        name: 'localhost:5000',
        isDirectory: (): boolean => true,
        parentPath: '/home/user/.config/containers/certs.d',
      });
      const mockCertFile = createMockDirent({
        name: 'server.cert',
        isFile: (): boolean => true,
        parentPath: '/home/user/.config/containers/certs.d/localhost:5000',
      });

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockImplementation((async (dirPath: unknown, _options?: unknown) => {
        const pathStr = String(dirPath);
        if (pathStr.includes('.config/containers/certs.d') && !pathStr.includes('localhost:5000')) {
          return [mockDirent];
        }
        if (pathStr.includes('localhost:5000')) {
          return [mockCertFile];
        }
        return [];
      }) as typeof fs.readdir);

      const result = await customService.detectCustomCertificates();

      expect(result).toMatchObject({
        hasCustomCertificates: true,
        certificateCount: 1,
      });
    });

    test('should handle scan timeout and report it through telemetry', async () => {
      vi.useFakeTimers();

      const shortTimeoutConfig: Partial<CertificateDetectionConfig> = {
        scanTimeoutMs: 1,
      };
      const serviceWithTimeout = new CertificateDetectionService(mockTelemetryLogger, shortTimeoutConfig);

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockReturnValue(new Promise(() => {}));

      const detection = serviceWithTimeout.detectCustomCertificates();
      await vi.runAllTimersAsync();
      const result = await detection;

      expect(result).toMatchObject({
        hasCustomCertificates: false,
        certificateCount: 0,
        errors: [{ error: 'Scan operation timed out' }],
      });
      expect(mockTelemetryLogger.logUsage).toHaveBeenCalledWith(
        'custom_certs',
        expect.objectContaining({
          using_custom_certificates: false,
          certificate_count: 0,
          errors: 'Scan operation timed out',
        }),
      );
    });

    test('should clear the scan timeout once the scan completed', async () => {
      vi.useFakeTimers();

      mockOneCertificate();

      await serviceWithTelemetry.detectCustomCertificates();

      expect(vi.getTimerCount()).toBe(0);
    });

    test('should handle general errors gracefully with telemetry enabled', async () => {
      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockRejectedValue(new Error('Critical file system error'));

      const result = await serviceWithTelemetry.detectCustomCertificates();

      expect(result).toMatchObject({
        hasCustomCertificates: false,
        certificateCount: 0,
      });
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0]).toMatchObject({
        error: 'Critical file system error',
      });
    });

    test('should send telemetry when certificates are found', async () => {
      mockOneCertificate();

      await serviceWithTelemetry.detectCustomCertificates();

      expect(mockTelemetryLogger.logUsage).toHaveBeenCalledWith(
        'custom_certs',
        expect.objectContaining({
          using_custom_certificates: true,
          certificate_count: 1,
          scan_duration_ms: expect.any(Number),
          is_windows: false,
          is_linux: false,
          is_mac: false,
          errors: '',
        }),
      );
    });

    test('should not send telemetry when no certificates and no errors are found', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

      const result = await serviceWithTelemetry.detectCustomCertificates();

      expect(result).toMatchObject({
        hasCustomCertificates: false,
        certificateCount: 0,
        scanDurationMs: expect.any(Number),
        errors: [],
      });
      expect(mockTelemetryLogger.logUsage).not.toHaveBeenCalled();
    });

    test('should not send telemetry when disabled', async () => {
      const noTelemetryConfig: Partial<CertificateDetectionConfig> = {
        enableTelemetry: false,
      };
      const serviceWithoutTelemetry = new CertificateDetectionService(mockTelemetryLogger, noTelemetryConfig);
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

      await serviceWithoutTelemetry.detectCustomCertificates();

      expect(mockTelemetryLogger.logUsage).not.toHaveBeenCalled();
    });
  });

  describe('platform detection', () => {
    test.each([
      { platform: 'Windows', flag: 'isWindows', expected: { is_windows: true, is_mac: false, is_linux: false } },
      { platform: 'macOS', flag: 'isMac', expected: { is_windows: false, is_mac: true, is_linux: false } },
      { platform: 'Linux', flag: 'isLinux', expected: { is_windows: false, is_mac: false, is_linux: true } },
    ] as const)(
      'should detect $platform environment with telemetry enabled',
      async ({ flag, expected }): Promise<void> => {
        vi.mocked(env)[flag] = true;
        mockOneCertificate();

        await serviceWithTelemetry.detectCustomCertificates();

        expect(mockTelemetryLogger.logUsage).toHaveBeenCalledWith('custom_certs', expect.objectContaining(expected));
      },
    );
  });

  describe('Windows/WSL2 path handling', () => {
    test('should handle Windows paths correctly with telemetry enabled', async () => {
      const windowsHome = 'C:\\Users\\testuser';
      vi.mocked(env).isWindows = true;
      vi.mocked(os.homedir).mockReturnValue(windowsHome);

      mockOneCertificate(`${windowsHome}/.config/containers/certs.d`);

      await serviceWithTelemetry.detectCustomCertificates();

      expect(fs.access).toHaveBeenCalledWith(SYSTEM_CERTS_DIR, expect.any(Number));
      expect(fs.access).toHaveBeenCalledWith(expect.stringContaining('testuser'), expect.any(Number));
      expect(mockTelemetryLogger.logUsage).toHaveBeenCalledWith(
        'custom_certs',
        expect.objectContaining({
          is_windows: true,
        }),
      );
    });

    test('should handle WSL2 paths correctly with telemetry enabled', async () => {
      vi.mocked(env).isWindows = true;
      vi.mocked(os.homedir).mockReturnValue('/mnt/c/Users/testuser');

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockResolvedValue([]);

      await serviceWithTelemetry.detectCustomCertificates();

      expect(fs.access).toHaveBeenCalledWith('/etc/containers/certs.d', expect.any(Number));
      expect(fs.access).toHaveBeenCalledWith(expect.stringContaining('mnt/c/Users/testuser'), expect.any(Number));
    });

    test('should handle macOS paths correctly with telemetry enabled', async () => {
      vi.mocked(env).isMac = true;
      vi.mocked(os.homedir).mockReturnValue('/Users/testuser');

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockResolvedValue([]);

      await serviceWithTelemetry.detectCustomCertificates();

      expect(fs.access).toHaveBeenCalledWith('/etc/containers/certs.d', expect.any(Number));
      expect(fs.access).toHaveBeenCalledWith(expect.stringContaining('Users/testuser'), expect.any(Number));
    });

    test('should handle Linux paths correctly with telemetry enabled', async () => {
      vi.mocked(env).isLinux = true;
      vi.mocked(os.homedir).mockReturnValue('/home/testuser');

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockResolvedValue([]);

      await serviceWithTelemetry.detectCustomCertificates();

      expect(fs.access).toHaveBeenCalledWith('/etc/containers/certs.d', expect.any(Number));
      expect(fs.access).toHaveBeenCalledWith(expect.stringContaining('home/testuser'), expect.any(Number));
    });
  });

  describe('certificate file validation', () => {
    test('should count valid certificate extensions with telemetry enabled', async () => {
      const mockFiles: Dirent[] = [
        createMockDirent({
          name: 'ca.crt',
          isFile: (): boolean => true,
          parentPath: '/etc/containers/certs.d/registry.example.com',
        }),
        createMockDirent({
          name: 'server.cert',
          isFile: (): boolean => true,
          parentPath: '/etc/containers/certs.d/registry.example.com',
        }),
        createMockDirent({
          name: 'client.key',
          isFile: (): boolean => true,
          parentPath: '/etc/containers/certs.d/registry.example.com',
        }),
      ];

      createMockFileSystemWithCerts('registry.example.com', mockFiles);

      const result = await serviceWithTelemetry.detectCustomCertificates();

      expect(result.certificateCount).toBe(3);
    });

    test('should exclude files with excluded extensions with telemetry enabled', async () => {
      const mockFiles: Dirent[] = [
        createMockDirent({
          name: 'ca.crt',
          isFile: (): boolean => true,
          parentPath: '/etc/containers/certs.d/registry.example.com',
        }),
        createMockDirent({
          name: 'excluded.pem',
          isFile: (): boolean => true,
          parentPath: '/etc/containers/certs.d/registry.example.com',
        }),
        createMockDirent({
          name: 'excluded.cer',
          isFile: (): boolean => true,
          parentPath: '/etc/containers/certs.d/registry.example.com',
        }),
      ];

      createMockFileSystemWithCerts('registry.example.com', mockFiles);

      const result = await serviceWithTelemetry.detectCustomCertificates();

      expect(result.certificateCount).toBe(1);
    });

    test('should ignore files in root directory (depth 0) with telemetry enabled', async () => {
      const mockFiles: Dirent[] = [
        createMockDirent({
          name: 'ca.crt',
          isFile: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
        createMockDirent({
          name: 'registry.example.com',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
      ];

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockImplementation((async (dirPath: unknown, _options?: unknown) => {
        const pathStr = String(dirPath);
        if (pathStr === '/etc/containers/certs.d') {
          return mockFiles;
        }
        if (pathStr.includes('registry.example.com')) {
          return [];
        }
        return [];
      }) as typeof fs.readdir);

      const result = await serviceWithTelemetry.detectCustomCertificates();

      expect(result.certificateCount).toBe(0);
    });
  });

  describe('registry directory validation', () => {
    test('should accept valid hostname formats with telemetry enabled', async () => {
      const validDirectories: Dirent[] = [
        createMockDirent({
          name: 'registry.example.com',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
        createMockDirent({
          name: 'localhost',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
        createMockDirent({
          name: 'example.com',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
      ];

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockImplementation((async (dirPath: unknown, _options?: unknown) => {
        const pathStr = String(dirPath);
        if (pathStr === '/etc/containers/certs.d') {
          return validDirectories;
        }
        return [];
      }) as typeof fs.readdir);

      await serviceWithTelemetry.detectCustomCertificates();

      expect(fs.readdir).toHaveBeenCalledWith(expect.stringContaining('registry.example.com'), expect.any(Object));
      expect(fs.readdir).toHaveBeenCalledWith(expect.stringContaining('localhost'), expect.any(Object));
      expect(fs.readdir).toHaveBeenCalledWith(expect.stringContaining('example.com'), expect.any(Object));
    });

    test('should accept valid hostname:port formats with telemetry enabled', async () => {
      const validDirectories: Dirent[] = [
        createMockDirent({
          name: 'registry.example.com:5000',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
        createMockDirent({
          name: 'localhost:8080',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
      ];

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockImplementation((async (dirPath: unknown, _options?: unknown) => {
        const pathStr = String(dirPath);
        if (pathStr === '/etc/containers/certs.d') {
          return validDirectories;
        }
        return [];
      }) as typeof fs.readdir);

      await serviceWithTelemetry.detectCustomCertificates();

      expect(fs.readdir).toHaveBeenCalledWith(expect.stringContaining('registry.example.com:5000'), expect.any(Object));
      expect(fs.readdir).toHaveBeenCalledWith(expect.stringContaining('localhost:8080'), expect.any(Object));
    });

    test('should reject invalid directory names with telemetry enabled', async () => {
      const invalidDirectories: Dirent[] = [
        createMockDirent({
          name: '.hidden',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
        createMockDirent({
          name: '-invalid',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
        createMockDirent({
          name: 'invalid_name',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
      ];

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockImplementation((async (dirPath: unknown, _options?: unknown) => {
        const pathStr = String(dirPath);
        if (pathStr === '/etc/containers/certs.d') {
          return invalidDirectories;
        }
        return [];
      }) as typeof fs.readdir);

      await serviceWithTelemetry.detectCustomCertificates();

      expect(fs.readdir).not.toHaveBeenCalledWith(expect.stringContaining('.hidden'), expect.any(Object));
      expect(fs.readdir).not.toHaveBeenCalledWith(expect.stringContaining('-invalid'), expect.any(Object));
      expect(fs.readdir).not.toHaveBeenCalledWith(expect.stringContaining('invalid_name'), expect.any(Object));
    });

    test('should ignore symbolic links by default with telemetry enabled', async () => {
      const directories: Dirent[] = [
        createMockDirent({
          name: 'registry.example.com',
          isDirectory: (): boolean => true,
          isSymbolicLink: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
        createMockDirent({
          name: 'localhost',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
      ];

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockImplementation((async (dirPath: unknown, _options?: unknown) => {
        const pathStr = String(dirPath);
        if (pathStr === '/etc/containers/certs.d') {
          return directories;
        }
        return [];
      }) as typeof fs.readdir);

      await serviceWithTelemetry.detectCustomCertificates();

      expect(fs.readdir).not.toHaveBeenCalledWith(expect.stringContaining('registry.example.com'), expect.any(Object));
      expect(fs.readdir).toHaveBeenCalledWith(expect.stringContaining('localhost'), expect.any(Object));
    });

    test('should follow symbolic links when configured with telemetry enabled', async () => {
      const followSymlinksConfig: Partial<CertificateDetectionConfig> = {
        followSymlinks: true,
      };
      const serviceWithSymlinks = new CertificateDetectionService(mockTelemetryLogger, followSymlinksConfig);

      const mockDirent = createMockDirent({
        name: 'registry.example.com',
        isDirectory: (): boolean => true,
        parentPath: '/etc/containers/certs.d',
      });
      const mockSymlinkFile = createMockDirent({
        name: 'symlink.crt',
        isSymbolicLink: (): boolean => true,
        parentPath: '/etc/containers/certs.d/registry.example.com',
      });

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockImplementation((async (dirPath: unknown, _options?: unknown) => {
        const pathStr = String(dirPath);
        if (pathStr === '/etc/containers/certs.d') {
          return [mockDirent];
        }
        if (pathStr.includes('registry.example.com')) {
          return [mockSymlinkFile];
        }
        return [];
      }) as typeof fs.readdir);

      const result = await serviceWithSymlinks.detectCustomCertificates();

      expect(result.certificateCount).toBe(1);
    });
  });

  describe('error handling', () => {
    test('should collect directory scan errors with telemetry enabled', async () => {
      const mockDirent = createMockDirent({
        name: 'registry.example.com',
        isDirectory: (): boolean => true,
        parentPath: '/etc/containers/certs.d',
      });

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockImplementation((async (dirPath: unknown, _options?: unknown) => {
        const pathStr = String(dirPath);
        if (pathStr === '/etc/containers/certs.d') {
          return [mockDirent];
        }
        if (pathStr.includes('registry.example.com')) {
          const error = new Error('Permission denied') as NodeJS.ErrnoException;
          error.code = 'EACCES';
          throw error;
        }
        return [];
      }) as typeof fs.readdir);

      const result = await serviceWithTelemetry.detectCustomCertificates();

      expect(result.errors).toEqual([{ error: 'Permission denied', code: 'EACCES' }]);
    });

    test('should continue scanning after directory errors with telemetry enabled', async () => {
      const mockDirents: Dirent[] = [
        createMockDirent({
          name: 'registry.example.com',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
        createMockDirent({
          name: 'localhost',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
      ];
      const mockCertFile = createMockDirent({
        name: 'ca.crt',
        isFile: (): boolean => true,
        parentPath: '/etc/containers/certs.d/localhost',
      });

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockImplementation((async (dirPath: unknown, _options?: unknown) => {
        const pathStr = String(dirPath);
        if (pathStr === '/etc/containers/certs.d') {
          return mockDirents;
        }
        if (pathStr.includes('registry.example.com')) {
          throw new Error('Permission denied');
        }
        if (pathStr.includes('localhost')) {
          return [mockCertFile];
        }
        return [];
      }) as typeof fs.readdir);

      const result = await serviceWithTelemetry.detectCustomCertificates();

      expect(result.certificateCount).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('updateConfig', () => {
    test('should update configuration', () => {
      const service = new CertificateDetectionService();
      const newConfig: Partial<CertificateDetectionConfig> = {
        scanTimeoutMs: 15000,
        validCertExtensions: ['.crt', '.pem'],
      };

      expect(() => service.updateConfig(newConfig)).not.toThrow();
    });
  });

  describe('telemetry formatting', () => {
    test('should format errors correctly in telemetry', async () => {
      const mockDirent = createMockDirent({
        name: 'registry.example.com',
        isDirectory: (): boolean => true,
        parentPath: '/etc/containers/certs.d',
      });

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockImplementation((async (dirPath: unknown, _options?: unknown) => {
        const pathStr = String(dirPath);
        if (pathStr === '/etc/containers/certs.d') {
          return [mockDirent];
        }
        if (pathStr.includes('registry.example.com')) {
          const error = new Error('Access denied') as NodeJS.ErrnoException;
          error.code = 'EACCES';
          throw error;
        }
        return [];
      }) as typeof fs.readdir);

      await serviceWithTelemetry.detectCustomCertificates();

      expect(mockTelemetryLogger.logUsage).toHaveBeenCalledWith(
        'custom_certs',
        expect.objectContaining({
          errors: 'Access denied (EACCES)',
        }),
      );
    });

    test('should format multiple errors correctly in telemetry', async () => {
      const mockDirents: Dirent[] = [
        createMockDirent({
          name: 'registry1.example.com',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
        createMockDirent({
          name: 'registry2.example.com',
          isDirectory: (): boolean => true,
          parentPath: '/etc/containers/certs.d',
        }),
      ];

      vi.mocked(fs.access).mockResolvedValue();
      vi.mocked(fs.readdir).mockImplementation((async (dirPath: unknown, _options?: unknown): Promise<Dirent[]> => {
        const pathStr = String(dirPath);
        if (pathStr === '/etc/containers/certs.d') {
          return mockDirents;
        }
        if (pathStr.includes('registry1.example.com')) {
          const error = new Error('Error 1') as NodeJS.ErrnoException;
          error.code = 'EACCES';
          throw error;
        }
        if (pathStr.includes('registry2.example.com')) {
          throw new Error('Error 2');
        }
        return [];
      }) as typeof fs.readdir);

      await serviceWithTelemetry.detectCustomCertificates();

      expect(mockTelemetryLogger.logUsage).toHaveBeenCalledWith(
        'custom_certs',
        expect.objectContaining({
          errors: 'Error 1 (EACCES); Error 2',
        }),
      );
    });
  });
});
