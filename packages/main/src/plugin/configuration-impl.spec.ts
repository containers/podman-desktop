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

import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import {
  CONFIGURATION_DEFAULT_SCOPE,
  CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE,
  CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE,
} from '@desktop-framework/api/configuration';
import type * as containerDesktopAPI from '@desktop-framework/extension-api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ConfigurationImpl } from './configuration-impl.js';

let configurationImpl: TestConfigurationImpl;

class TestConfigurationImpl extends ConfigurationImpl {
  getUpdateCallback(): (sectionName: string, scope: containerDesktopAPI.ConfigurationScope) => void {
    return this.updateCallback;
  }

  async originalUpdate(section: string, value: unknown): Promise<void> {
    const localKey = this.getLocalKey(section);
    // now look if we have this value
    const localView = this.getLocalView();

    // remove the value if undefined
    if (value === undefined) {
      if (localView[localKey]) {
        delete localView[section];
        delete this[localKey];
      }
    } else {
      localView[localKey] = value;
      this[section] = value;
    }
  }
}

beforeEach(() => {
  vi.resetAllMocks();
  const map = new Map<string, { [key: string]: unknown }>();
  configurationImpl = new TestConfigurationImpl(
    {
      send: vi.fn(),
    } as unknown as ApiSenderType,
    vi.fn(),
    map,
  );
});

test('Should callback on update with configuration key', async () => {
  await configurationImpl.update('key', 'value');
  expect(configurationImpl.getUpdateCallback()).toBeCalledWith('key', 'DEFAULT');
});

test('Uses localKey when deleting values', async () => {
  // Test with globalSection to ensure localKey != section
  const sendMock = vi.fn();
  const map = new Map<string, { [key: string]: unknown }>();
  const config = new TestConfigurationImpl({ send: sendMock } as unknown as ApiSenderType, vi.fn(), map, 'prefix');

  // Set value
  await config.update('key', 'value');
  // stored with section
  expect(config['key']).toBe('value');
  // NOT stored with localKey
  expect(config['prefix.key']).toBeUndefined();
  expect(config.get('key')).toBe('value');
  expect(sendMock).toHaveBeenCalledWith('configuration-changed', {
    key: 'prefix.key',
    value: 'value',
  });

  // Delete value
  await config.update('key', undefined);
  // deleted using localKey
  expect(config['prefix.key']).toBeUndefined();
  expect(config.get('key')).toBeUndefined();
  expect(sendMock).toHaveBeenCalledWith('configuration-changed', {
    key: 'prefix.key',
    value: undefined,
  });
});

test('should return value from configuration when present', () => {
  // Create the "scope" of the configuration
  const map = new Map<string, { [key: string]: unknown }>();
  map.set(CONFIGURATION_DEFAULT_SCOPE, { 'test.section.key': 'testValue' });

  // Should return it fine
  const config = new ConfigurationImpl(
    { send: vi.fn() } as unknown as ApiSenderType,
    vi.fn(),
    map,
    'test.section',
    CONFIGURATION_DEFAULT_SCOPE,
  );

  const result = config.get<string>('key');
  expect(result).toBe('testValue');
});

test('should return default value when configuration value is undefined', () => {
  // Create the scope
  const map = new Map<string, { [key: string]: unknown }>();
  const config = new ConfigurationImpl(
    { send: vi.fn() } as unknown as ApiSenderType,
    vi.fn(),
    map,
    'test.section',
    CONFIGURATION_DEFAULT_SCOPE,
  );

  // Expect the value to be set correctly
  const result = config.get<string>('nonexistent', 'defaultValue');
  expect(result).toBe('defaultValue');
});

test('should return true when value exists', () => {
  // Create the scope
  const map = new Map<string, { [key: string]: unknown }>();
  map.set(CONFIGURATION_DEFAULT_SCOPE, { 'test.section.key': 'testValue' });
  const config = new ConfigurationImpl(
    { send: vi.fn() } as unknown as ApiSenderType,
    vi.fn(),
    map,
    'test.section',
    CONFIGURATION_DEFAULT_SCOPE,
  );

  // Should have the value
  const result = config.has('key');
  expect(result).toBe(true);
});

test('should return false when value does not exist', () => {
  // Create the scope
  const map = new Map<string, { [key: string]: unknown }>();
  const config = new ConfigurationImpl(
    { send: vi.fn() } as unknown as ApiSenderType,
    vi.fn(),
    map,
    'test.section',
    CONFIGURATION_DEFAULT_SCOPE,
  );

  // Should not exist when not set
  const result = config.has('nonexistent');
  expect(result).toBe(false);
});

test('should return admin defaults scope for admin defaults configuration', () => {
  // Return the defaults
  const map = new Map<string, { [key: string]: unknown }>();
  const config = new ConfigurationImpl(
    { send: vi.fn() } as unknown as ApiSenderType,
    vi.fn(),
    map,
    'test.section',
    CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE,
  );
  expect(config.getConfigurationKey()).toBe(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE);
});

test('should get values from admin defaults scope configuration', () => {
  // The below section makes sure that when retrieving from a separate section (managed defaults scope), it'll work the exact same way.
  // kind of a silly test, but it still makes sure that the constants are set fine at least.
  const map = new Map<string, { [key: string]: unknown }>();
  map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, { 'test.section.key': 'adminValue' });

  const config = new ConfigurationImpl(
    { send: vi.fn() } as unknown as ApiSenderType,
    vi.fn(),
    map,
    'test.section',
    CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE,
  );

  const result = config.get<string>('key');
  expect(result).toBe('adminValue');
});

test('if there are multiple scopes with different values, make sure we get the right one', () => {
  // Create the scopes
  const map = new Map<string, { [key: string]: unknown }>();
  map.set(CONFIGURATION_DEFAULT_SCOPE, { 'test.section.key': 'defaultValue' });
  map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, { 'test.section.key': 'adminValue' });

  // Should return it fine
  const configDefault = new ConfigurationImpl(
    { send: vi.fn() } as unknown as ApiSenderType,
    vi.fn(),
    map,
    'test.section',
    CONFIGURATION_DEFAULT_SCOPE,
  );
  const configAdmin = new ConfigurationImpl(
    { send: vi.fn() } as unknown as ApiSenderType,
    vi.fn(),
    map,
    'test.section',
    CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE,
  );

  // Expect that we can get the values and that they are correct (we aren't grabbing from the wrong scope)
  const resultDefault = configDefault.get<string>('key');
  expect(resultDefault).toBe('defaultValue');
  const resultAdmin = configAdmin.get<string>('key');
  expect(resultAdmin).toBe('adminValue');
});

describe('locked configuration handling', () => {
  test('should return managed defaults value when configuration key is locked', () => {
    // Create the scopes with locked configuration
    const map = new Map<string, { [key: string]: unknown }>();
    map.set(CONFIGURATION_DEFAULT_SCOPE, { 'telemetry.enabled': false });
    map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, { 'telemetry.enabled': true });
    map.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, { locked: ['telemetry.enabled'] });

    // Create configuration for default scope
    const config = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'telemetry',
      CONFIGURATION_DEFAULT_SCOPE,
    );

    // Should return managed defaults value (true) instead of user's value (false)
    const result = config.get<boolean>('enabled');
    expect(result).toBe(true);
  });

  test('should return user value when configuration key is not locked', () => {
    // Create the scopes with locked configuration for a different key
    const map = new Map<string, { [key: string]: unknown }>();
    map.set(CONFIGURATION_DEFAULT_SCOPE, { 'telemetry.enabled': false });
    map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, { 'telemetry.enabled': true });
    map.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, { locked: ['some.other.key'] });

    // Create configuration for default scope
    const config = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'telemetry',
      CONFIGURATION_DEFAULT_SCOPE,
    );

    // Should return user's value (false) since telemetry.enabled is not locked
    const result = config.get<boolean>('enabled');
    expect(result).toBe(false);
  });

  test('should return user value when locked list is empty', () => {
    // Create the scopes with empty locked list
    const map = new Map<string, { [key: string]: unknown }>();
    map.set(CONFIGURATION_DEFAULT_SCOPE, { 'telemetry.enabled': false });
    map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, { 'telemetry.enabled': true });
    map.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, { locked: [] });

    // Create configuration for default scope
    const config = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'telemetry',
      CONFIGURATION_DEFAULT_SCOPE,
    );

    // Should return user's value (false) since nothing is locked
    const result = config.get<boolean>('enabled');
    expect(result).toBe(false);
  });

  test('should return user value when no locked configuration exists', () => {
    // Create the scopes without locked configuration
    const map = new Map<string, { [key: string]: unknown }>();
    map.set(CONFIGURATION_DEFAULT_SCOPE, { 'telemetry.enabled': false });
    map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, { 'telemetry.enabled': true });

    // Create configuration for default scope
    const config = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'telemetry',
      CONFIGURATION_DEFAULT_SCOPE,
    );

    // Should return user's value (false) since there's no locked configuration
    const result = config.get<boolean>('enabled');
    expect(result).toBe(false);
  });

  test('should return default value when key is locked but not in managed defaults', () => {
    // Create the scopes with locked key but no managed defaults value
    const map = new Map<string, { [key: string]: unknown }>();
    map.set(CONFIGURATION_DEFAULT_SCOPE, {});
    map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, {});
    map.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, { locked: ['telemetry.enabled'] });

    // Create configuration for default scope
    const config = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'telemetry',
      CONFIGURATION_DEFAULT_SCOPE,
    );

    // Should return default value since key is locked but not in managed defaults
    const result = config.get<boolean>('enabled', true);
    expect(result).toBe(true);
  });

  test('should handle realistic config with locked telemetry.check', () => {
    // Realistic user configuration with lots of settings
    const userConfig = {
      'proxy.http': 'https://127.0.0.1:8081',
      'telemetry.check': true, // User wants telemetry check enabled
      'statusbarProviders.showProviders': {
        remindAt: 1758312136049,
        disabled: false,
      },
      'releaseNotesBanner.show': '1.21.0',
      'compose.binary.installComposeSystemWide': true,
      'kubectl.binary.installKubectlSystemWide': true,
      'welcome.version': 'initial',
      'window.bounds': {
        x: 446,
        y: 304,
        width: 1263,
        height: 906,
      },
      'learningCenter.expanded': false,
      'extensions.disabled': [],
      'preferences.update.reminder': 'never',
    };

    // Admin forces telemetry.check to be disabled (corporate policy or whatever)
    const managedDefaults = {
      'telemetry.check': false, // Force telemetry check OFF
    };

    // Only telemetry.check is locked, everything else is user-controlled
    const lockedConfig = {
      locked: ['telemetry.check'],
    };

    const map = new Map<string, { [key: string]: unknown }>();
    map.set(CONFIGURATION_DEFAULT_SCOPE, userConfig);
    map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, managedDefaults);
    map.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, lockedConfig);

    // Test telemetry.check (locked key)
    const telemetryCheckConfig = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'telemetry',
      CONFIGURATION_DEFAULT_SCOPE,
    );

    // Should return managed value (false) instead of user's value (true) because it's locked
    const checkResult = telemetryCheckConfig.get<boolean>('check');
    expect(checkResult).toBe(false);

    // Test other unlocked config values still work
    const proxyConfig = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'proxy',
      CONFIGURATION_DEFAULT_SCOPE,
    );
    expect(proxyConfig.get<string>('http')).toBe('https://127.0.0.1:8081');

    const windowConfig = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'window',
      CONFIGURATION_DEFAULT_SCOPE,
    );
    expect(windowConfig.get<{ x: number; y: number; width: number; height: number }>('bounds')).toEqual({
      x: 446,
      y: 304,
      width: 1263,
      height: 906,
    });
  });

  test('should handle multiple locked keys simultaneously', () => {
    const userConfig = {
      'proxy.http': 'https://user-proxy.com:8080',
      'telemetry.enabled': false,
      'telemetry.check': true,
      'extensions.autoUpdate': true,
    };

    const managedDefaults = {
      'proxy.http': 'https://corporate-proxy.com:3128', // Corporate proxy
      'telemetry.enabled': true, // Force telemetry on
      'extensions.autoUpdate': false, // Disable auto-updates
    };

    const lockedConfig = {
      locked: ['proxy.http', 'telemetry.enabled', 'extensions.autoUpdate'],
    };

    const map = new Map<string, { [key: string]: unknown }>();
    map.set(CONFIGURATION_DEFAULT_SCOPE, userConfig);
    map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, managedDefaults);
    map.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, lockedConfig);

    // All three locked keys should return managed values
    const proxyConfig = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'proxy',
      CONFIGURATION_DEFAULT_SCOPE,
    );
    expect(proxyConfig.get<string>('http')).toBe('https://corporate-proxy.com:3128');

    const telemetryEnabledConfig = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'telemetry',
      CONFIGURATION_DEFAULT_SCOPE,
    );
    expect(telemetryEnabledConfig.get<boolean>('enabled')).toBe(true);

    const extensionsConfig = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'extensions',
      CONFIGURATION_DEFAULT_SCOPE,
    );
    expect(extensionsConfig.get<boolean>('autoUpdate')).toBe(false);

    // Unlocked key should still return user's value
    const telemetryCheckConfig = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'telemetry',
      CONFIGURATION_DEFAULT_SCOPE,
    );
    expect(telemetryCheckConfig.get<boolean>('check')).toBe(true);
  });

  test('should handle locked keys with complex object values', () => {
    const userConfig = {
      'docker.settings': {
        cpus: 4,
        memory: 8192,
        disk: 100,
      },
    };

    const managedDefaults = {
      'docker.settings': {
        cpus: 2,
        memory: 4096,
        disk: 50,
      },
    };

    const lockedConfig = {
      locked: ['docker.settings'],
    };

    const map = new Map<string, { [key: string]: unknown }>();
    map.set(CONFIGURATION_DEFAULT_SCOPE, userConfig);
    map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, managedDefaults);
    map.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, lockedConfig);

    const dockerConfig = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'docker',
      CONFIGURATION_DEFAULT_SCOPE,
    );

    // Should return managed object instead of user's object
    const settings = dockerConfig.get<{ cpus: number; memory: number; disk: number }>('settings');
    expect(settings).toEqual({
      cpus: 2,
      memory: 4096,
      disk: 50,
    });
  });

  test('should handle locked key with array values', () => {
    const userConfig = {
      'extensions.disabled': ['extension-a', 'extension-b'],
    };

    const managedDefaults = {
      'extensions.disabled': ['extension-x', 'extension-y', 'extension-z'],
    };

    const lockedConfig = {
      locked: ['extensions.disabled'],
    };

    const map = new Map<string, { [key: string]: unknown }>();
    map.set(CONFIGURATION_DEFAULT_SCOPE, userConfig);
    map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, managedDefaults);
    map.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, lockedConfig);

    const extensionsConfig = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'extensions',
      CONFIGURATION_DEFAULT_SCOPE,
    );

    // Should return managed array instead of user's array
    const disabled = extensionsConfig.get<string[]>('disabled');
    expect(disabled).toEqual(['extension-x', 'extension-y', 'extension-z']);
  });

  test('should handle locked key when user has not set any value', () => {
    const userConfig = {
      'other.setting': 'some-value',
    };

    const managedDefaults = {
      'telemetry.enabled': true,
    };

    const lockedConfig = {
      locked: ['telemetry.enabled'],
    };

    const map = new Map<string, { [key: string]: unknown }>();
    map.set(CONFIGURATION_DEFAULT_SCOPE, userConfig);
    map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, managedDefaults);
    map.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, lockedConfig);

    const telemetryConfig = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'telemetry',
      CONFIGURATION_DEFAULT_SCOPE,
    );

    // Should return managed value even though user never set this key
    expect(telemetryConfig.get<boolean>('enabled')).toBe(true);
  });

  test('should not apply locked config when in non-default scope', () => {
    const userConfig = {
      'telemetry.enabled': false,
    };

    const managedDefaults = {
      'telemetry.enabled': true,
    };

    const lockedConfig = {
      locked: ['telemetry.enabled'],
    };

    const map = new Map<string, { [key: string]: unknown }>();
    map.set(CONFIGURATION_DEFAULT_SCOPE, userConfig);
    map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, managedDefaults);
    map.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, lockedConfig);

    // When in managed defaults scope, locked keys should NOT be enforced
    const telemetryConfigManaged = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'telemetry',
      CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE,
    );

    // Should return the value from managed scope, not enforcing the lock
    expect(telemetryConfigManaged.get<boolean>('enabled')).toBe(true);
  });

  test('should return user value when locked key has no managed value', () => {
    const userConfig = {
      'telemetry.enabled': false,
    };

    const managedDefaults = {
      // No value for telemetry.enabled
    };

    const lockedConfig = {
      locked: ['telemetry.enabled'],
    };

    const map = new Map<string, { [key: string]: unknown }>();
    map.set(CONFIGURATION_DEFAULT_SCOPE, userConfig);
    map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, managedDefaults);
    map.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, lockedConfig);

    const telemetryConfig = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'telemetry',
      CONFIGURATION_DEFAULT_SCOPE,
    );

    // When locked key has no managed value, falls back to user's value
    expect(telemetryConfig.get<boolean>('enabled')).toBe(false);
  });

  test('should return fallback default when locked key has no managed value and no user value', () => {
    const userConfig = {
      // User has not set telemetry.enabled
    };

    const managedDefaults = {
      // No value for telemetry.enabled
    };

    const lockedConfig = {
      locked: ['telemetry.enabled'],
    };

    const map = new Map<string, { [key: string]: unknown }>();
    map.set(CONFIGURATION_DEFAULT_SCOPE, userConfig);
    map.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, managedDefaults);
    map.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, lockedConfig);

    const telemetryConfig = new ConfigurationImpl(
      { send: vi.fn() } as unknown as ApiSenderType,
      vi.fn(),
      map,
      'telemetry',
      CONFIGURATION_DEFAULT_SCOPE,
    );

    // When locked key has no managed value AND no user value, use fallback default
    expect(telemetryConfig.get<boolean>('enabled', true)).toBe(true);
    expect(telemetryConfig.get<boolean>('enabled', false)).toBe(false);
  });
});
