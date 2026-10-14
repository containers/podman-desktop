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

import {
  CONFIGURATION_LOCKED_KEY,
  CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE,
  CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE,
} from '@desktop-framework/api/configuration';
import { beforeEach, describe, expect, test } from 'vitest';

import { LockedKeys } from './lock-configuration.js';

describe('LockedKeys.getAllKeys', () => {
  let configurationValues: Map<string, { [key: string]: unknown }>;
  let lockedKeys: LockedKeys;

  beforeEach(() => {
    configurationValues = new Map();
    lockedKeys = new LockedKeys(configurationValues);
  });

  test('should return empty set when no locked configuration exists', () => {
    const result = lockedKeys.getAllKeys();
    expect(result).toEqual(new Set());
  });

  test('should return empty set when locked configuration has no "locked" property', () => {
    configurationValues.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, {});
    const result = lockedKeys.getAllKeys();
    expect(result).toEqual(new Set());
  });

  test('should return empty set when "locked" property is not an array', () => {
    configurationValues.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, {
      [CONFIGURATION_LOCKED_KEY]: 'not-an-array',
    });
    const result = lockedKeys.getAllKeys();
    expect(result.size).toEqual(0);
  });

  test('should return set of locked keys when locked configuration exists', () => {
    configurationValues.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, {
      [CONFIGURATION_LOCKED_KEY]: ['key1', 'key2', 'key3'],
    });
    const result = lockedKeys.getAllKeys();
    expect(result).toEqual(new Set(['key1', 'key2', 'key3']));
  });
});

describe('Simple tests covering .get for LockedKeys', () => {
  let configurationValues: Map<string, { [key: string]: unknown }>;
  let lockedKeys: LockedKeys;

  beforeEach(() => {
    configurationValues = new Map();
    lockedKeys = new LockedKeys(configurationValues);
  });

  test('should return undefined when no locked configuration exists', () => {
    const result = lockedKeys.get('some.key');
    expect(result).toBeUndefined();
  });

  test('should return undefined when locked configuration has no "locked" property', () => {
    configurationValues.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, {});
    const result = lockedKeys.get('some.key');
    expect(result).toBeUndefined();
  });

  test('should return undefined when key is not in locked list', () => {
    configurationValues.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, {
      [CONFIGURATION_LOCKED_KEY]: ['other.key', 'another.key'],
    });
    const result = lockedKeys.get('some.key');
    expect(result).toBeUndefined();
  });

  test('should return managed default value when key is locked', () => {
    configurationValues.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, {
      [CONFIGURATION_LOCKED_KEY]: ['some.key'],
    });
    configurationValues.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, {
      'some.key': 'managed-value',
    });
    const result = lockedKeys.get('some.key');
    expect(result).toBe('managed-value');
  });
});
