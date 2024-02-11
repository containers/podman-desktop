/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
import type { ApiSenderType } from '/@/plugin/api.js';
import type { NotificationRegistry } from './notification-registry.js';

let configurationRegistry: ConfigurationRegistry;

// mock the fs methods
const readFileSync = vi.spyOn(fs, 'readFileSync');
const cpSync = vi.spyOn(fs, 'cpSync');

const getConfigurationDirectoryMock = vi.fn();
const directories = {
  getConfigurationDirectory: getConfigurationDirectoryMock,
} as unknown as Directories;
const apiSender = {
  send: vi.fn(),
} as unknown as ApiSenderType;

const notificationRegistry = {
  addNotification: vi.fn(),
} as unknown as NotificationRegistry;

let registerConfigurationsDisposable: Disposable;

beforeAll(() => {
  // mock the fs module
  vi.mock('node:fs');
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
  getConfigurationDirectoryMock.mockReturnValue('/my-config-dir');

  configurationRegistry = new ConfigurationRegistry(apiSender, directories);
  readFileSync.mockReturnValue(JSON.stringify({}));

  cpSync.mockReturnValue(undefined);
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

test('should work with an invalid configuration file', async () => {
  vi.resetAllMocks();

  getConfigurationDirectoryMock.mockReturnValue('/my-config-dir');

  configurationRegistry = new ConfigurationRegistry(apiSender, directories);
  readFileSync.mockReturnValue('invalid JSON content');

  // configuration is broken but it should not throw any error, just that config is empty
  const originalConsoleError = console.error;
  const mockedConsoleLog = vi.fn();
  console.error = mockedConsoleLog;
  try {
    configurationRegistry.init().forEach(notification => notificationRegistry.addNotification(notification));
  } finally {
    console.error = originalConsoleError;
  }

  expect(configurationRegistry.getConfigurationProperties()).toEqual({});
  expect(mockedConsoleLog).toBeCalledWith(expect.stringContaining('Unable to parse'), expect.anything());

  // check we added a notification
  expect(notificationRegistry.addNotification).toBeCalledWith(
    expect.objectContaining({ highlight: true, type: 'warn', title: 'Corrupted configuration file' }),
  );

  // check we did a backup of the file
  expect(cpSync).toBeCalledWith(
    expect.stringContaining('settings.json'),
    expect.stringContaining('settings.json.backup'),
  );
});

test('addConfigurationEnum', async () => {
  const enumNode: IConfigurationNode = {
    id: 'my.enum.property',
    title: 'Fake Enum Property',
    type: 'object',
    properties: {
      ['my.fake.enum.property']: {
        description: 'Autostart container engine when launching Podman Desktop',
        type: 'string',
        default: 'myDefault',
        enum: ['myValue1', 'myValue2'],
      },
    },
  };

  configurationRegistry.registerConfigurations([enumNode]);

  // now call the addConfigurationEnum
  const disposable = configurationRegistry.addConfigurationEnum('my.fake.enum.property', ['myValue3'], 'myDefault');

  const records = configurationRegistry.getConfigurationProperties();
  const record = records['my.fake.enum.property'];
  expect(record).toBeDefined();
  expect(record.enum).toEqual(['myValue1', 'myValue2', 'myValue3']);

  // now call the dispose
  disposable.dispose();

  // should be removed after disposable

  const afterDisposeRecord = records['my.fake.enum.property'];
  expect(afterDisposeRecord).toBeDefined();
  expect(afterDisposeRecord.enum).toEqual(['myValue1', 'myValue2']);
});

test('addConfigurationEnum with a previous default value', async () => {
  const enumNode: IConfigurationNode = {
    id: 'my.enum.property',
    title: 'Fake Enum Property',
    type: 'object',
    properties: {
      ['my.fake.enum.property']: {
        description: 'Autostart container engine when launching Podman Desktop',
        type: 'string',
        default: 'myDefault',
        enum: ['myValue1', 'myValue2'],
      },
    },
  };

  configurationRegistry.registerConfigurations([enumNode]);

  // now call the addConfigurationEnum
  const disposable = configurationRegistry.addConfigurationEnum('my.fake.enum.property', ['myValue3'], 'myValue1');

  // set value to myValue3
  await configurationRegistry.updateConfigurationValue('my.fake.enum.property', 'myValue3');

  const records = configurationRegistry.getConfigurationProperties();
  const record = records['my.fake.enum.property'];
  expect(record).toBeDefined();
  expect(record.enum).toEqual(['myValue1', 'myValue2', 'myValue3']);

  // now call the dispose
  disposable.dispose();

  // check default property is no longer 'myValue3' but it is defaulted to myValue1
  const val = configurationRegistry.getConfiguration('my.fake')?.get<string>('enum.property');
  expect(val).toEqual('myValue1');
});
