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

import type { Configuration } from '@desktop-framework/extension-api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from './configuration-registry.js';
import { ExperimentalConfigurationManager } from './experimental-configuration-manager.js';
import type { Telemetry } from './telemetry/telemetry.js';

const mockedConfigurationRegistry = {
  updateConfigurationValue: vi.fn(),
  getConfiguration: vi.fn(),
} as unknown as ConfigurationRegistry;

const mockedTelemetry = {
  track: vi.fn(),
} as unknown as Telemetry;

let experimentalConfigurationManager: ExperimentalConfigurationManager;

beforeEach(() => {
  vi.resetAllMocks();
  experimentalConfigurationManager = new ExperimentalConfigurationManager(mockedConfigurationRegistry, mockedTelemetry);
});

describe('ExperimentalConfigurationManager', () => {
  describe('parseKey', () => {
    test('should parse valid configuration key with section and property', () => {
      const result = experimentalConfigurationManager.parseKey('kubernetes.statesExperimental');
      expect(result).toEqual({
        section: 'kubernetes',
        property: 'statesExperimental',
      });
    });

    test('should parse key with multiple dots correctly', () => {
      const result = experimentalConfigurationManager.parseKey('kubernetes.nested.property');
      expect(result).toEqual({
        section: 'kubernetes',
        property: 'nested.property',
      });
    });

    test.each([
      { key: 'kubernetes', description: 'should return empty strings for key without dot' },
      { key: '.kubernetes', description: 'should return empty strings for key starting with dot' },
      { key: 'kubernetes.', description: 'should return empty strings for key ending with dot' },
      { key: '', description: 'should return empty strings for empty string' },
    ])('$description', ({ key }) => {
      const result = experimentalConfigurationManager.parseKey(key);
      expect(result).toEqual({
        section: '',
        property: '',
      });
    });
  });

  describe('updateExperimentalConfigurationValue', () => {
    test('should update configuration with object value by stringifying and parsing', async () => {
      const config = { enabled: true };
      const key = 'kubernetes.statesExperimental';
      const scope = 'DEFAULT';

      await experimentalConfigurationManager.updateExperimentalConfigurationValue(key, config, scope);

      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenCalledWith(key, { enabled: true }, scope);
    });

    test('should update configuration with non-object value directly', async () => {
      const config = 'string-value';
      const key = 'kubernetes.statesExperimental';
      const scope = 'DEFAULT';

      await experimentalConfigurationManager.updateExperimentalConfigurationValue(key, config, scope);

      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenCalledWith(key, config, scope);
    });

    test('should update configuration without scope', async () => {
      const config = { enabled: true };
      const key = 'kubernetes.statesExperimental';

      await experimentalConfigurationManager.updateExperimentalConfigurationValue(key, config);

      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenCalledWith(
        key,
        { enabled: true },
        undefined,
      );
    });

    test('should handle undefined config value', async () => {
      const config = undefined;
      const key = 'kubernetes.statesExperimental';
      const scope = 'DEFAULT';

      await experimentalConfigurationManager.updateExperimentalConfigurationValue(key, config, scope);

      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenCalledWith(key, undefined, scope);
    });

    test('should track telemetry with enabled=true when config is an object', async () => {
      const key = 'kubernetes.statesExperimental';
      await experimentalConfigurationManager.updateExperimentalConfigurationValue(key, {}, 'DEFAULT');

      expect(mockedTelemetry.track).toHaveBeenCalledWith('experimentalConfigurationUpdate', {
        key,
        enabled: true,
      });
    });

    test('should track telemetry with enabled=false when config is false', async () => {
      const key = 'kubernetes.statesExperimental';
      await experimentalConfigurationManager.updateExperimentalConfigurationValue(key, false, 'DEFAULT');

      expect(mockedTelemetry.track).toHaveBeenCalledWith('experimentalConfigurationUpdate', {
        key,
        enabled: false,
      });
    });

    test('should track telemetry with enabled=false when config is undefined', async () => {
      const key = 'kubernetes.statesExperimental';
      await experimentalConfigurationManager.updateExperimentalConfigurationValue(key, undefined, 'DEFAULT');

      expect(mockedTelemetry.track).toHaveBeenCalledWith('experimentalConfigurationUpdate', {
        key,
        enabled: false,
      });
    });
  });

  describe('enableExperimentalConfiguration', () => {
    test('should enable configuration with single scope', async () => {
      const key = 'kubernetes.statesExperimental';
      const scope = 'DEFAULT';

      await experimentalConfigurationManager.enableExperimentalConfiguration(key, scope);

      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenCalledWith(key, {}, scope);
    });

    test('should enable configuration with array of scopes', async () => {
      const key = 'kubernetes.statesExperimental';
      const scopes = ['DEFAULT', 'ContainerConnection'];

      await experimentalConfigurationManager.enableExperimentalConfiguration(key, scopes);

      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenCalledTimes(2);
      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenNthCalledWith(1, key, {}, scopes[0]);
      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenNthCalledWith(2, key, {}, scopes[1]);
    });

    test('should enable configuration without scope', async () => {
      const key = 'kubernetes.statesExperimental';

      await experimentalConfigurationManager.enableExperimentalConfiguration(key);

      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenCalledWith(key, {}, undefined);
    });
  });

  describe('disableExperimentalConfiguration', () => {
    test('should disable configuration with single scope', async () => {
      const key = 'kubernetes.statesExperimental';
      const scope = 'DEFAULT';

      await experimentalConfigurationManager.disableExperimentalConfiguration(key, scope);

      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenCalledWith(key, false, scope);
    });

    test('should disable configuration with array of scopes', async () => {
      const key = 'kubernetes.statesExperimental';
      const scopes = ['DEFAULT', 'ContainerConnection'];

      await experimentalConfigurationManager.disableExperimentalConfiguration(key, scopes);

      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenCalledTimes(2);
      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenNthCalledWith(1, key, false, scopes[0]);
      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenNthCalledWith(2, key, false, scopes[1]);
    });

    test('should disable configuration without scope', async () => {
      const key = 'kubernetes.statesExperimental';

      await experimentalConfigurationManager.disableExperimentalConfiguration(key);

      expect(mockedConfigurationRegistry.updateConfigurationValue).toHaveBeenCalledWith(key, false, undefined);
    });
  });

  describe('isExperimentalConfigurationEnabled', () => {
    test('should return true when configuration is an object', () => {
      const key = 'kubernetes.statesExperimental';
      const scope = 'DEFAULT';
      const mockConfig = { get: vi.fn().mockReturnValue({ enabled: true }) };
      vi.mocked(mockedConfigurationRegistry.getConfiguration).mockReturnValue(mockConfig as unknown as Configuration);

      const result = experimentalConfigurationManager.isExperimentalConfigurationEnabled(key, scope);

      expect(result).toBe(true);
      expect(mockedConfigurationRegistry.getConfiguration).toHaveBeenCalledWith('kubernetes', scope);
      expect(mockConfig.get).toHaveBeenCalledWith('statesExperimental');
    });

    test('should return false when configuration is not an object', () => {
      const key = 'kubernetes.statesExperimental';
      const scope = 'DEFAULT';
      const mockConfig = { get: vi.fn().mockReturnValue('string-value') };
      vi.mocked(mockedConfigurationRegistry.getConfiguration).mockReturnValue(mockConfig as unknown as Configuration);

      const result = experimentalConfigurationManager.isExperimentalConfigurationEnabled(key, scope);

      expect(result).toBe(false);
    });

    test('should return false when configuration is undefined', () => {
      const key = 'kubernetes.statesExperimental';
      const scope = 'DEFAULT';
      const mockConfig = { get: vi.fn().mockReturnValue(undefined) };
      vi.mocked(mockedConfigurationRegistry.getConfiguration).mockReturnValue(mockConfig as unknown as Configuration);

      const result = experimentalConfigurationManager.isExperimentalConfigurationEnabled(key, scope);

      expect(result).toBe(false);
    });

    test('should return value when configuration is boolean true', () => {
      const key = 'kubernetes.statesExperimental';
      const scope = 'DEFAULT';
      const mockConfig = { get: vi.fn().mockReturnValue(true) };
      vi.mocked(mockedConfigurationRegistry.getConfiguration).mockReturnValue(mockConfig as unknown as Configuration);

      const result = experimentalConfigurationManager.isExperimentalConfigurationEnabled(key, scope);

      expect(result).toBe(true);
    });

    test('should return value when configuration is boolean false', () => {
      const key = 'kubernetes.statesExperimental';
      const scope = 'DEFAULT';
      const mockConfig = { get: vi.fn().mockReturnValue(false) };
      vi.mocked(mockedConfigurationRegistry.getConfiguration).mockReturnValue(mockConfig as unknown as Configuration);

      const result = experimentalConfigurationManager.isExperimentalConfigurationEnabled(key, scope);

      expect(result).toBe(false);
    });

    test('should return false for invalid key without section or property', () => {
      const key = 'invalid-key';

      const result = experimentalConfigurationManager.isExperimentalConfigurationEnabled(key);

      expect(result).toBe(false);
      expect(mockedConfigurationRegistry.getConfiguration).not.toHaveBeenCalled();
    });

    test('should work without scope', () => {
      const key = 'kubernetes.statesExperimental';
      const mockConfig = { get: vi.fn().mockReturnValue({}) };
      vi.mocked(mockedConfigurationRegistry.getConfiguration).mockReturnValue(mockConfig as unknown as Configuration);

      const result = experimentalConfigurationManager.isExperimentalConfigurationEnabled(key);

      expect(result).toBe(true);
      expect(mockedConfigurationRegistry.getConfiguration).toHaveBeenCalledWith('kubernetes', undefined);
    });

    test('should check array of scopes and return true if any scope has object value', () => {
      const key = 'kubernetes.statesExperimental';
      const scopes = ['DEFAULT', 'ContainerConnection'];

      const mockConfig1 = { get: vi.fn().mockReturnValue(undefined) };
      const mockConfig2 = { get: vi.fn().mockReturnValue({ enabled: true }) };

      vi.mocked(mockedConfigurationRegistry.getConfiguration)
        .mockReturnValueOnce(mockConfig1 as unknown as Configuration)
        .mockReturnValueOnce(mockConfig2 as unknown as Configuration);

      const result = experimentalConfigurationManager.isExperimentalConfigurationEnabled(key, scopes);

      expect(result).toBe(true);
      expect(mockedConfigurationRegistry.getConfiguration).toHaveBeenCalledTimes(2);
      expect(mockedConfigurationRegistry.getConfiguration).toHaveBeenNthCalledWith(1, 'kubernetes', scopes[0]);
      expect(mockedConfigurationRegistry.getConfiguration).toHaveBeenNthCalledWith(2, 'kubernetes', scopes[1]);
    });

    test('should check array of scopes and return false if no scope has object value', () => {
      const key = 'kubernetes.statesExperimental';
      const scopes = ['DEFAULT', 'ContainerConnection'];

      const mockConfig1 = { get: vi.fn().mockReturnValue(undefined) };
      const mockConfig2 = { get: vi.fn().mockReturnValue('string') };

      vi.mocked(mockedConfigurationRegistry.getConfiguration)
        .mockReturnValueOnce(mockConfig1 as unknown as Configuration)
        .mockReturnValueOnce(mockConfig2 as unknown as Configuration);

      const result = experimentalConfigurationManager.isExperimentalConfigurationEnabled(key, scopes);

      expect(result).toBe(false);
      expect(mockedConfigurationRegistry.getConfiguration).toHaveBeenCalledTimes(2);
    });
  });
});
