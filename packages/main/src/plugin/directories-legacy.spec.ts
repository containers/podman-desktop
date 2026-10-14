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

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { isLinux, isMac, isWindows } from '/@/util.js';
import product from '/@product.json' with { type: 'json' };

import type { Directories } from './directories.js';
import { LegacyDirectories } from './directories-legacy.js';

const originalProcessEnv = process.env;

// Mock file system
vi.mock(import('node:fs'));
vi.mock(import('/@/util.js'));
vi.mock(import('/@product.json'));

beforeEach(() => {
  // Reset environment variables to clean state
  process.env = { ...originalProcessEnv };

  vi.mocked(product).appId = 'io.test_app.TestApp';
  vi.mocked(product).paths = {
    config: 'containers/test-app',
    managed: {
      macOS: '/Library/Application Support/io.test_app.TestApp',
      windows: '%PROGRAMDATA%\\Test App',
      linux: '/usr/share/test-app',
      flatpak: '/run/host/usr/share/test-app',
    },
  };

  vi.mocked(fs.existsSync).mockReturnValue(true);
  vi.mocked(fs.mkdirSync).mockReturnValue('');
});

afterEach(() => {
  process.env = originalProcessEnv;
  vi.restoreAllMocks();
});

describe('LegacyDirectories', () => {
  let provider: Directories;

  describe('Default Directory Structure', () => {
    beforeEach(() => {
      // Mock the static property that was evaluated at module load time
      Object.defineProperty(LegacyDirectories, 'XDG_DATA_DIRECTORY', {
        value: `.local${path.sep}share${path.sep}containers${path.sep}test-app`,
        writable: true,
        configurable: true,
      });
      provider = new LegacyDirectories();
    });

    test('should use default legacy base directory', () => {
      const expectedBaseDir = path.resolve(os.homedir(), '.local', 'share', 'containers', 'test-app');
      expect(provider.getDataDirectory()).toBe(expectedBaseDir);
    });

    test('should place all directories under same base directory', () => {
      const baseDir = provider.getDataDirectory();
      const configDir = provider.getConfigurationDirectory();

      expect(configDir).toBe(path.resolve(baseDir, 'configuration'));

      expect(provider.getPluginsDirectory()).toBe(path.resolve(baseDir, 'plugins'));
      expect(provider.getPluginsScanDirectory()).toBe(path.resolve(baseDir, 'plugins-scanning'));
      expect(provider.getExtensionsStorageDirectory()).toBe(path.resolve(baseDir, 'extensions-storage'));
      expect(provider.getContributionStorageDir()).toBe(path.resolve(baseDir, 'contributions'));
      expect(provider.getSafeStorageDirectory()).toBe(path.resolve(baseDir, 'safe-storage'));
    });
  });

  describe('Custom Directory Override', () => {
    test('should respect PODMAN_DESKTOP_HOME_DIR environment variable', () => {
      const customPath = '/custom/podman/directory';
      // biome-ignore lint/complexity/useLiteralKeys: <PODMAN_DESKTOP_HOME_DIR comes from an index signature>
      process.env['PODMAN_DESKTOP_HOME_DIR'] = customPath;

      // Create new instance to pick up environment variable
      provider = new LegacyDirectories();

      expect(provider.getDataDirectory()).toBe(customPath);
      expect(provider.getConfigurationDirectory()).toBe(path.resolve(customPath, 'configuration'));
      expect(provider.getPluginsDirectory()).toBe(path.resolve(customPath, 'plugins'));
    });

    test('should override default path completely when custom env var is set', () => {
      const customPath = '/custom/env/path';
      // biome-ignore lint/complexity/useLiteralKeys: <PODMAN_DESKTOP_HOME_DIR comes from an index signature>
      process.env['PODMAN_DESKTOP_HOME_DIR'] = customPath;

      provider = new LegacyDirectories();

      const dataDir = provider.getDataDirectory();

      // Should NOT use default path
      expect(dataDir).not.toContain(os.homedir());
      expect(dataDir).not.toContain(path.join('.local', 'share'));

      // Should use custom path exactly
      expect(dataDir).toBe(customPath);
    });
  });

  describe('Directory Creation', () => {
    test('should create base directory when it does not exist', () => {
      const mkdirSpy = vi.mocked(fs.mkdirSync);
      vi.mocked(fs.existsSync).mockReturnValue(false);

      provider = new LegacyDirectories();

      expect(mkdirSpy).toHaveBeenCalled();
    });
  });

  describe('getManagedDefaultsDirectory', () => {
    test('should return macOS managed folder path when running on macOS', () => {
      vi.mocked(isMac).mockReturnValue(true);
      vi.mocked(isWindows).mockReturnValue(false);
      vi.mocked(isLinux).mockReturnValue(false);

      provider = new LegacyDirectories();

      expect(provider.getManagedDefaultsDirectory()).toBe(product.paths.managed.macOS);
    });

    test('should use appId format for macOS managed folder path', () => {
      vi.mocked(isMac).mockReturnValue(true);
      vi.mocked(isWindows).mockReturnValue(false);
      vi.mocked(isLinux).mockReturnValue(false);

      provider = new LegacyDirectories();

      // The macOS managed path folder should be the appId (macOS format is different vs Windows / Linux)
      // so make sure we still have the correct format
      expect(provider.getManagedDefaultsDirectory()).toBe('/Library/Application Support/io.test_app.TestApp');
    });

    test('should map PROGRAMDATA into windows managed folder path', () => {
      vi.mocked(isMac).mockReturnValue(false);
      vi.mocked(isWindows).mockReturnValue(true);
      vi.mocked(isLinux).mockReturnValue(false);
      const customProgramData = 'D:\\CorpData';
      process.env['PROGRAMDATA'] = customProgramData;

      provider = new LegacyDirectories();

      expect(provider.getManagedDefaultsDirectory()).toBe(
        product.paths.managed.windows.replace('%PROGRAMDATA%', customProgramData),
      );
    });

    test('should default PROGRAMDATA when env variable is missing', () => {
      vi.mocked(isMac).mockReturnValue(false);
      vi.mocked(isWindows).mockReturnValue(true);
      vi.mocked(isLinux).mockReturnValue(false);
      delete process.env['PROGRAMDATA'];

      provider = new LegacyDirectories();

      expect(provider.getManagedDefaultsDirectory()).toBe(
        product.paths.managed.windows.replace('%PROGRAMDATA%', 'C:\\ProgramData'),
      );
    });

    test('should return linux managed folder path when running on Linux', () => {
      vi.mocked(isMac).mockReturnValue(false);
      vi.mocked(isWindows).mockReturnValue(false);
      vi.mocked(isLinux).mockReturnValue(true);

      provider = new LegacyDirectories();

      expect(provider.getManagedDefaultsDirectory()).toBe(product.paths.managed.linux);
    });

    test('should return flatpak managed folder path when running on Linux in Flatpak', () => {
      vi.mocked(isMac).mockReturnValue(false);
      vi.mocked(isWindows).mockReturnValue(false);
      vi.mocked(isLinux).mockReturnValue(true);
      // biome-ignore lint/complexity/useLiteralKeys: FLATPAK_ID comes from an index signature
      process.env['FLATPAK_ID'] = 'io.podman_desktop.PodmanDesktop';

      provider = new LegacyDirectories();

      expect(provider.getManagedDefaultsDirectory()).toBe(product.paths.managed.flatpak);
    });

    test('should fallback to linux managed folder path when platform is unknown', () => {
      vi.mocked(isMac).mockReturnValue(false);
      vi.mocked(isWindows).mockReturnValue(false);
      vi.mocked(isLinux).mockReturnValue(false);

      provider = new LegacyDirectories();

      expect(provider.getManagedDefaultsDirectory()).toBe(product.paths.managed.linux);
    });
  });
});
