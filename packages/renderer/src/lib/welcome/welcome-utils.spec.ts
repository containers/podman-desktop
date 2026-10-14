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

import type { OnboardingInfo, ProviderInfo } from '@desktop-framework/api';
import { WelcomeSettings } from '@desktop-framework/api/welcome';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { WelcomeUtils } from './welcome-utils';

let welcomeUtils: WelcomeUtils;

beforeEach(() => {
  vi.clearAllMocks();
  welcomeUtils = new WelcomeUtils();
});

test('should expect no value by default', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(undefined);
  const version = await welcomeUtils.getVersion();
  expect(version).toBeUndefined();
  expect(vi.mocked(window.getConfigurationValue)).toHaveBeenCalledWith(
    WelcomeSettings.SectionName + '.' + WelcomeSettings.Version,
  );
});

test('should expect value', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue('foo');
  const version = await welcomeUtils.getVersion();
  expect(version).toBe('foo');
  expect(vi.mocked(window.getConfigurationValue)).toHaveBeenCalledWith(
    WelcomeSettings.SectionName + '.' + WelcomeSettings.Version,
  );
});

const baseExtension: OnboardingInfo = {
  extension: 'ext1',
  name: 'ext1',
  displayName: 'Extension 1',
  icon: '',
  description: 'First extension',
  steps: [],
  title: 'Extension 1',
  removable: true,
  enablement: '',
};

describe('getSortedOnboardingExtensions', () => {
  test('returns empty array for empty inputs', () => {
    expect(welcomeUtils.getSortedOnboardingExtensions([], [])).toEqual([]);
  });

  test('marks all extensions as selected by default', () => {
    const extensions = [baseExtension];
    const result = welcomeUtils.getSortedOnboardingExtensions(extensions, []);

    expect(result).toHaveLength(1);
    expect(result[0]?.selected).toBe(true);
  });

  test('sets containerEngine true when provider has container connections', () => {
    const extensions = [baseExtension];
    const providers = [
      { extensionId: 'ext1', containerConnections: [{ name: 'connection1' }] },
    ] as unknown as ProviderInfo[];

    const result = welcomeUtils.getSortedOnboardingExtensions(extensions, providers);

    expect(result[0]?.containerEngine).toBe(true);
  });

  test('sets containerEngine false when provider has no container connections', () => {
    const extensions = [baseExtension];
    const providers = [{ extensionId: 'ext1', containerConnections: [] }] as unknown as ProviderInfo[];

    const result = welcomeUtils.getSortedOnboardingExtensions(extensions, providers);

    expect(result[0]?.containerEngine).toBe(false);
  });

  test('sorts extensions with container engines first', () => {
    const extensions = [
      { ...baseExtension, extension: 'no-engine', name: 'no-engine', displayName: 'No Engine' },
      { ...baseExtension, extension: 'has-engine', name: 'has-engine', displayName: 'Has Engine' },
    ];
    const providers = [
      { extensionId: 'has-engine', containerConnections: [{ name: 'conn' }] },
    ] as unknown as ProviderInfo[];

    const result = welcomeUtils.getSortedOnboardingExtensions(extensions, providers);

    expect(result[0]?.extension).toBe('has-engine');
    expect(result[1]?.extension).toBe('no-engine');
  });

  test('does not mutate the input array', () => {
    const extensions = [
      { ...baseExtension, extension: 'b' },
      { ...baseExtension, extension: 'a' },
    ];
    const original = [...extensions];

    welcomeUtils.getSortedOnboardingExtensions(extensions, []);

    expect(extensions).toEqual(original);
  });
});

describe('enforceFirstRun', () => {
  test('returns firstRun true and sets version on first run', async () => {
    vi.mocked(window.getPodmanDesktopVersion).mockResolvedValue('1.2.3');
    vi.mocked(window.getConfigurationValue).mockResolvedValue(undefined);

    const result = await welcomeUtils.enforceFirstRun();

    expect(result).toEqual({ version: '1.2.3', firstRun: true });
    expect(vi.mocked(window.updateConfigurationValue)).toHaveBeenCalledWith(
      WelcomeSettings.SectionName + '.' + WelcomeSettings.Version,
      'initial',
      'DEFAULT',
    );
    expect(vi.mocked(window.updateConfigurationValue)).toHaveBeenCalledWith('releaseNotesBanner.show', '1.2.3');
  });

  test('returns firstRun false when version already set', async () => {
    vi.mocked(window.getPodmanDesktopVersion).mockResolvedValue('1.2.3');
    vi.mocked(window.getConfigurationValue).mockResolvedValue('initial');

    const result = await welcomeUtils.enforceFirstRun();

    expect(result).toEqual({ version: '1.2.3', firstRun: false });
    expect(vi.mocked(window.updateConfigurationValue)).not.toHaveBeenCalled();
  });
});
