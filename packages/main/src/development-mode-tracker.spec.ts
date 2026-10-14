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

import { ExtensionLoaderSettings } from '@desktop-framework/api';
import type { Configuration } from '@desktop-framework/extension-api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { DevelopmentModeTracker } from './development-mode-tracker.js';
import type { ConfigurationRegistry } from './plugin/configuration-registry.js';

const configurationRegistry = {
  getConfiguration: vi.fn(),
  onDidChangeConfiguration: vi.fn(),
  onDidUpdateConfiguration: vi.fn(),
} as unknown as ConfigurationRegistry;

let developmentModeTracker: TestDevelopmentModeTracker;

class TestDevelopmentModeTracker extends DevelopmentModeTracker {
  override refreshConfigurationValue(): void {
    super.refreshConfigurationValue();
  }
}
beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  developmentModeTracker = new TestDevelopmentModeTracker(configurationRegistry);
});

test('foo', () => {
  // mock refreshConfigurationValue method
  const refreshConfigurationValueSpy = vi.spyOn(developmentModeTracker, 'refreshConfigurationValue');
  refreshConfigurationValueSpy.mockReturnValue();
  developmentModeTracker.init();

  // check we called the onDidUpdateConfiguration method
  expect(configurationRegistry.onDidUpdateConfiguration).toBeCalled();

  // check we called the onDidChangeConfiguration method
  expect(configurationRegistry.onDidChangeConfiguration).toBeCalled();

  // check we called the refreshConfigurationValue method
  expect(refreshConfigurationValueSpy).toBeCalled();

  // now check that if we call onDidUpdateConfiguration callback it will call refreshConfigurationValue method
  const onDidUpdateConfigurationCallback = vi.mocked(configurationRegistry.onDidUpdateConfiguration).mock.calls[0]?.[0];
  expect(onDidUpdateConfigurationCallback).toBeDefined();
  refreshConfigurationValueSpy.mockClear();
  // send dummy event
  onDidUpdateConfigurationCallback?.({ properties: ['fooEvent'] });
  // should not trigger a refresh
  expect(refreshConfigurationValueSpy).not.toBeCalled();
  // now send the expected property
  onDidUpdateConfigurationCallback?.({ properties: ['extensions.developmentMode'] });
  // and check that the refresh was called
  expect(refreshConfigurationValueSpy).toBeCalled();

  // now check that if we call onDidChangeConfiguration callback it will call refreshConfigurationValue method
  const onDidChangeConfigurationCallback = vi.mocked(configurationRegistry.onDidChangeConfiguration).mock.calls[0]?.[0];
  expect(onDidChangeConfigurationCallback).toBeDefined();
  refreshConfigurationValueSpy.mockClear();
  // send dummy event
  onDidChangeConfigurationCallback?.({ key: 'fooEvent', value: 'fooValue', scope: 'DEFAULT' });
  // should not trigger a refresh
  expect(refreshConfigurationValueSpy).not.toBeCalled();
  // now send the expected property
  onDidChangeConfigurationCallback?.({
    key: `${ExtensionLoaderSettings.SectionName}.${ExtensionLoaderSettings.DevelopmentMode}`,
    value: 'true',
    scope: 'DEFAULT',
  });
  // and check that the refresh was called
  expect(refreshConfigurationValueSpy).toBeCalled();
});

describe('refreshConfigurationValue', () => {
  test('first launch is triggering event', () => {
    // mock getConfiguration
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue({
      get: vi.fn().mockReturnValue(true),
    } as unknown as Configuration);

    // register a callback
    const onDidChangeDevelopmentModeCallback = vi.fn();
    developmentModeTracker.onDidChangeDevelopmentMode(onDidChangeDevelopmentModeCallback);

    // call the refresh
    developmentModeTracker.refreshConfigurationValue();

    // check that the callback was called
    expect(onDidChangeDevelopmentModeCallback).toBeCalledWith(true);
  });

  test('same value, no event triggered', () => {
    // mock getConfiguration
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue({
      get: vi.fn().mockReturnValue(true),
    } as unknown as Configuration);

    // register a callback
    const onDidChangeDevelopmentModeCallback = vi.fn();
    developmentModeTracker.onDidChangeDevelopmentMode(onDidChangeDevelopmentModeCallback);

    // call the refresh
    developmentModeTracker.refreshConfigurationValue();

    // clear the number of calls
    onDidChangeDevelopmentModeCallback.mockClear();

    // call the refresh again
    developmentModeTracker.refreshConfigurationValue();

    // check that the callback was not called
    expect(onDidChangeDevelopmentModeCallback).not.toBeCalled();
  });

  test('different value, event triggered', () => {
    // first call with true
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValueOnce({
      get: vi.fn().mockReturnValue(true),
    } as unknown as Configuration);
    // second call with false
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValueOnce({
      get: vi.fn().mockReturnValue(false),
    } as unknown as Configuration);

    // register a callback
    const onDidChangeDevelopmentModeCallback = vi.fn();
    developmentModeTracker.onDidChangeDevelopmentMode(onDidChangeDevelopmentModeCallback);

    // call the refresh
    developmentModeTracker.refreshConfigurationValue();

    // first call, called with true
    expect(onDidChangeDevelopmentModeCallback).toBeCalledWith(true);
    onDidChangeDevelopmentModeCallback.mockClear();

    // call the refresh again
    developmentModeTracker.refreshConfigurationValue();

    // second call, called with false
    expect(onDidChangeDevelopmentModeCallback).toBeCalledWith(false);
    onDidChangeDevelopmentModeCallback.mockClear();
  });
});
