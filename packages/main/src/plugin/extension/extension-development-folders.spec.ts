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
import { ExtensionDevelopmentFolderInfoSettings } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { Configuration } from '@desktop-framework/extension-api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';

import type { AnalyzedExtension, ExtensionAnalyzer } from './extension-analyzer.js';
import { ExtensionDevelopmentFolders } from './extension-development-folders.js';

const configurationRegistry = {
  registerConfigurations: vi.fn(),
  getConfiguration: vi.fn(),
  onDidChangeConfiguration: vi.fn(),
  onDidUpdateConfiguration: vi.fn(),
} as unknown as ConfigurationRegistry;

const apiSender = {
  send: vi.fn(),
} as unknown as ApiSenderType;

const extensionAnalyzer = {
  analyzeExtension: vi.fn(),
} as unknown as ExtensionAnalyzer;

class TestExtensionDevelopmentFolders extends ExtensionDevelopmentFolders {
  override refreshFolders(): void {
    super.refreshFolders();
  }

  override saveToConfiguration(): Promise<void> {
    return super.saveToConfiguration();
  }
}

let extensionDevelopmentFolders: TestExtensionDevelopmentFolders;
beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();

  extensionDevelopmentFolders = new TestExtensionDevelopmentFolders(
    configurationRegistry,
    extensionAnalyzer,
    apiSender,
  );
});

test('init', async () => {
  // mock refreshFolders method
  const refreshFoldersSpy = vi.spyOn(extensionDevelopmentFolders, 'refreshFolders');
  refreshFoldersSpy.mockReturnValue();

  // call init method
  extensionDevelopmentFolders.init();

  // check we called the onDidChangeConfiguration method
  expect(configurationRegistry.onDidChangeConfiguration).toBeCalled();

  // check we called the refreshFolders method
  expect(refreshFoldersSpy).toBeCalled();

  // now check that if we call onDidChangeConfiguration callback it will call refreshFolders method
  const onDidChangeConfigurationCallback = vi.mocked(configurationRegistry.onDidChangeConfiguration).mock.calls[0]?.[0];
  expect(onDidChangeConfigurationCallback).toBeDefined();
  refreshFoldersSpy.mockClear();
  // send dummy event
  onDidChangeConfigurationCallback?.({ key: 'fooEvent', value: 'fooValue', scope: 'DEFAULT' });
  // should not trigger a refresh
  expect(refreshFoldersSpy).not.toBeCalled();
  // now send the expected property
  onDidChangeConfigurationCallback?.({
    key: `${ExtensionDevelopmentFolderInfoSettings.SectionName}.${ExtensionDevelopmentFolderInfoSettings.DevelopmentExtensionsFolders}`,
    value: `['foo', 'bar']`,
    scope: 'DEFAULT',
  });
  // and check that the refresh was called
  expect(refreshFoldersSpy).toBeCalled();

  // check registerConfigurations method
  expect(configurationRegistry.registerConfigurations).toBeCalled();
  const configuration = vi.mocked(configurationRegistry.registerConfigurations).mock.calls[0]?.[0];
  expect(configuration?.[0]).toBeDefined();
  expect(configuration?.[0]?.id).toBe('preferences.extensions');
  expect(configuration?.[0]?.title).toBe('Extensions');
  expect(configuration?.[0]?.type).toBe('object');
  expect(configuration?.[0]?.properties).toBeDefined();
  const properties = configuration?.[0]?.properties;
  expect(properties).toHaveProperty(
    `${ExtensionDevelopmentFolderInfoSettings.SectionName}.${ExtensionDevelopmentFolderInfoSettings.DevelopmentExtensionsFolders}`,
  );
  const property =
    properties?.[
      `${ExtensionDevelopmentFolderInfoSettings.SectionName}.${ExtensionDevelopmentFolderInfoSettings.DevelopmentExtensionsFolders}`
    ];
  expect(property).toHaveProperty('description', 'List of extension folders to monitor');
  expect(property).toHaveProperty('type', 'array');
  expect(property).toHaveProperty('default', []);
  expect(property).toHaveProperty('hidden', true);
});

test('refreshFolders', async () => {
  // mock an empty value first
  vi.mocked(configurationRegistry.getConfiguration).mockReturnValueOnce({
    get: vi.fn(() => []),
  } as unknown as Configuration);

  const callbackOnDidUpdateDevelopmentFolders = vi.fn();
  extensionDevelopmentFolders.onDidUpdateDevelopmentFolders(callbackOnDidUpdateDevelopmentFolders);
  // call init
  extensionDevelopmentFolders.init();

  // check that the callback was called as it is first start
  expect(callbackOnDidUpdateDevelopmentFolders).toBeCalledWith([]);

  // grab the value
  expect(extensionDevelopmentFolders.getDevelopmentFolders()).toHaveLength(0);

  // now return 2 values
  vi.mocked(configurationRegistry.getConfiguration).mockReturnValueOnce({
    get: vi.fn(() => ['foo', 'bar']),
  } as unknown as Configuration);

  // call refresh
  extensionDevelopmentFolders.refreshFolders();

  // check that the callback was called as value has changed
  expect(callbackOnDidUpdateDevelopmentFolders).toBeCalledWith([{ path: 'foo' }, { path: 'bar' }]);

  // grab the value
  expect(extensionDevelopmentFolders.getDevelopmentFolders()).toHaveLength(2);
  // check the values
  expect(extensionDevelopmentFolders.getDevelopmentFolders()).toStrictEqual([{ path: 'foo' }, { path: 'bar' }]);

  // now return the same value
  vi.mocked(configurationRegistry.getConfiguration).mockReturnValueOnce({
    get: vi.fn(() => ['foo', 'bar']),
  } as unknown as Configuration);
  callbackOnDidUpdateDevelopmentFolders.mockClear();

  // call refresh
  extensionDevelopmentFolders.refreshFolders();

  // value should be the same
  expect(extensionDevelopmentFolders.getDevelopmentFolders()).toHaveLength(2);
  // check the values
  expect(extensionDevelopmentFolders.getDevelopmentFolders()).toStrictEqual([{ path: 'foo' }, { path: 'bar' }]);

  // no callback should be called
  expect(callbackOnDidUpdateDevelopmentFolders).not.toBeCalled();
});

test('saveToConfiguration', async () => {
  // mock update function
  vi.mocked(configurationRegistry.getConfiguration).mockReturnValue({
    get: vi.fn(() => ['foo', 'bar']),
    update: vi.fn(),
  } as unknown as Configuration);

  // init the values
  extensionDevelopmentFolders.init();

  // call the method
  await extensionDevelopmentFolders.saveToConfiguration();

  // expect to have called the update method
  expect(configurationRegistry.getConfiguration().update).toBeCalledWith(
    ExtensionDevelopmentFolderInfoSettings.DevelopmentExtensionsFolders,
    ['foo', 'bar'],
  );

  // expect apiSender be called
  expect(apiSender.send).toBeCalledWith('extensions-development-folders-changed');
});

test('removeDevelopmentFolder', async () => {
  // mock saveToConfiguration method
  const saveToConfigurationSpy = vi.spyOn(extensionDevelopmentFolders, 'saveToConfiguration');
  saveToConfigurationSpy.mockResolvedValue();

  // mock config with 2 values
  vi.mocked(configurationRegistry.getConfiguration).mockReturnValue({
    get: vi.fn(() => ['foo', 'bar']),
  } as unknown as Configuration);

  const callbackOnDidUpdateDevelopmentFolders = vi.fn();
  extensionDevelopmentFolders.onDidUpdateDevelopmentFolders(callbackOnDidUpdateDevelopmentFolders);

  // init the values
  extensionDevelopmentFolders.init();

  // call the method
  await extensionDevelopmentFolders.removeDevelopmentFolder('bar');

  // expect to have called the update method
  expect(saveToConfigurationSpy).toBeCalled();

  // expect callback to be called with only foo as bar was removed
  expect(callbackOnDidUpdateDevelopmentFolders).toBeCalledWith([{ path: 'foo' }]);
});

describe('addDevelopmentFolder', () => {
  test('check path already exists', async () => {
    // mock config with 2 values
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue({
      get: vi.fn(() => ['foo', 'bar']),
    } as unknown as Configuration);

    // init the values
    extensionDevelopmentFolders.init();

    await expect(extensionDevelopmentFolders.addDevelopmentFolder('foo')).rejects.toThrow(
      'Path foo already exist in the list',
    );
  });

  test('check error analyzing the extension', async () => {
    vi.mocked(extensionAnalyzer.analyzeExtension).mockResolvedValue({
      error: 'foo analyze extension',
    } as AnalyzedExtension);

    await expect(extensionDevelopmentFolders.addDevelopmentFolder('foo')).rejects.toThrow('foo analyze extension');
  });

  test('check missing main file when analyzing the extension', async () => {
    vi.mocked(extensionAnalyzer.analyzeExtension).mockResolvedValue({
      manifest: { main: 'unknown/file.js', engines: { 'podman-desktop': '>=1.18.0' } },
      error: 'foo analyze extension',
    } as AnalyzedExtension);

    await expect(extensionDevelopmentFolders.addDevelopmentFolder('foo')).rejects.toThrow('foo analyze extension');
  });

  test('check missing engine when analyzing the extension', async () => {
    vi.mocked(extensionAnalyzer.analyzeExtension).mockResolvedValue({} as AnalyzedExtension);

    await expect(extensionDevelopmentFolders.addDevelopmentFolder('foo')).rejects.toThrow(
      `is not compatible with Podman Desktop. It requires 'podman-desktop' engine.`,
    );
  });

  test('check working extension', async () => {
    const analyzedExtension = {
      path: 'foo',
      manifest: { engines: { 'podman-desktop': '>=1.18.0' } },
    } as AnalyzedExtension;
    vi.mocked(extensionAnalyzer.analyzeExtension).mockResolvedValue(analyzedExtension);

    // mock saveToConfiguration method
    const saveToConfigurationSpy = vi.spyOn(extensionDevelopmentFolders, 'saveToConfiguration');
    saveToConfigurationSpy.mockResolvedValue();

    const callbackOnDidUpdateDevelopmentFolders = vi.fn();
    extensionDevelopmentFolders.onDidUpdateDevelopmentFolders(callbackOnDidUpdateDevelopmentFolders);

    const callbackOnNeedToLoadExension = vi.fn();
    extensionDevelopmentFolders.onNeedToLoadExension(callbackOnNeedToLoadExension);

    await extensionDevelopmentFolders.addDevelopmentFolder('foo');

    // expect to have called the saveToConfiguration
    expect(saveToConfigurationSpy).toBeCalled();

    // expect callback to be called with foo
    expect(callbackOnDidUpdateDevelopmentFolders).toBeCalledWith([{ path: 'foo' }]);

    // expect to have called the onNeedToLoadExension
    expect(callbackOnNeedToLoadExension).toBeCalledWith(analyzedExtension);
  });
});
