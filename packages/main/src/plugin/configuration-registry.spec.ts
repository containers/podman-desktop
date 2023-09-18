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

import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import * as fs from 'node:fs';
import type { IConfigurationNode } from './configuration-registry.js';
import { ConfigurationRegistry } from './configuration-registry.js';
import type { Directories } from './directories.js';
import type { Disposable } from './types/disposable.js';

let configurationRegistry: ConfigurationRegistry;

// mock the fs methods
const readFileSync = vi.spyOn(fs, 'readFileSync');

const getConfigurationDirectoryMock = vi.fn();
const directories = {
  getConfigurationDirectory: getConfigurationDirectoryMock,
} as unknown as Directories;

let registerConfigurationsDisposable: Disposable;

beforeAll(() => {
  // mock the fs module
  vi.mock('node:fs');
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
  getConfigurationDirectoryMock.mockReturnValue('/my-config-dir');

  configurationRegistry = new ConfigurationRegistry(directories);
  readFileSync.mockReturnValue(JSON.stringify({}));

  configurationRegistry.init();

  const node: IConfigurationNode = {
    id: 'my.fake.property',
    title: 'Fake Property',
    type: 'object',
    properties: {
      ['my.fake.property']: {
        description: 'Autostart container engine when launching Podman Desktop',
        type: 'string',
        default: 'myDefault',
      },
    },
  };

  registerConfigurationsDisposable = configurationRegistry.registerConfigurations([node]);
});

describe('should be notified when a configuration is changed', async () => {
  test('affectsConfiguration exact name', async () => {
    let expectAffectsConfiguration;
    let called = false;
    let updatedValue;
    configurationRegistry.onDidChangeConfigurationAPI(e => {
      called = true;
      expectAffectsConfiguration = e.affectsConfiguration('my.fake.property');
      if (expectAffectsConfiguration) {
        updatedValue = configurationRegistry.getConfiguration('my.fake')?.get<string>('property');
      }
    });
    await configurationRegistry.updateConfigurationValue('my.fake.property', 'myValue');

    expect(called).toBeTruthy();
    expect(expectAffectsConfiguration).toBeTruthy();
    expect(updatedValue).toEqual('myValue');
  });

  test('affectsConfiguration partial name', async () => {
    let expectAffectsConfiguration;
    let called = false;
    let updatedValue;
    configurationRegistry.onDidChangeConfigurationAPI(e => {
      called = true;
      // use a parent property name
      expectAffectsConfiguration = e.affectsConfiguration('my.fake');
      if (expectAffectsConfiguration) {
        updatedValue = configurationRegistry.getConfiguration('my.fake')?.get<string>('property');
      }
    });
    await configurationRegistry.updateConfigurationValue('my.fake.property', 'myValue');

    expect(called).toBeTruthy();
    expect(expectAffectsConfiguration).toBeTruthy();
    expect(updatedValue).toEqual('myValue');
  });

  test('affectsConfiguration different name', async () => {
    let expectAffectsConfiguration;
    let called = false;

    configurationRegistry.onDidChangeConfigurationAPI(e => {
      called = true;
      // should not match
      expectAffectsConfiguration = e.affectsConfiguration('my.other.property');
    });
    await configurationRegistry.updateConfigurationValue('my.fake.property', 'myValue');

    expect(called).toBeTruthy();
    expect(expectAffectsConfiguration).toBeFalsy();
  });

  test('affectsConfiguration called twice when updating value with two scopes', async () => {
    let expectAffectsConfiguration: boolean;
    let called = false;
    let callNumber = 0;
    let updatedValue: unknown;
    configurationRegistry.onDidChangeConfiguration(() => {
      callNumber += 1;
    });
    configurationRegistry.onDidChangeConfigurationAPI(e => {
      called = true;
      // use a parent property name
      expectAffectsConfiguration = e.affectsConfiguration('my.fake');
      if (expectAffectsConfiguration) {
        updatedValue = configurationRegistry.getConfiguration('my.fake')?.get<string>('property');
      }
    });

    await configurationRegistry.updateConfigurationValue('my.fake.property', 'myValue', ['DEFAULT', 'scope']);

    expect(called).toBeTruthy();
    expect(callNumber).toBe(2);
    expect(updatedValue).toEqual('myValue');
  });
});

test('Should not find configuration after dispose', async () => {
  let records = configurationRegistry.getConfigurationProperties();
  const record = records['my.fake.property'];
  expect(record).toBeDefined();
  registerConfigurationsDisposable.dispose();

  // should be removed after disposable
  records = configurationRegistry.getConfigurationProperties();
  const afterDisposeRecord = records['my.fake.property'];
  expect(afterDisposeRecord).toBeUndefined();
});
