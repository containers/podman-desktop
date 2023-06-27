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

import { afterEach, expect, test, vi } from 'vitest';
import type { DiagnosticInfoProvider } from '@podman-desktop/api';
import {
  AboutInfoProvider,
  CompositeGeneralDiagnosticInfoProvider,
  ConfigurationInfoProvider,
  DisplayInfoProvider,
  SystemInfoProvider,
} from './diagnostic-provider';
import os from 'node:os';
import { ConfigurationRegistry } from '../plugin/configuration-registry';

const originalArgv = process.argv;

vi.mock('electron', () => {
  return {
    app: {
      name: 'appName',
      getVersion: vi.fn().mockReturnValue('0.0.1'),
      isPackaged: true,
    },
    screen: {
      getAllDisplays: vi.fn().mockReturnValue([
        {
          label: 'test_display',
          scaleFactor: 1,
          workAreaSize: {
            width: 1,
            height: 1,
          },
        },
      ]),
    },
  };
});

afterEach(() => {
  process.argv = originalArgv;
});

class InfoProviderA implements DiagnosticInfoProvider {
  title = 'A';

  collectInfo(): Promise<string> {
    return Promise.resolve('A Content\n');
  }
}

class InfoProviderB implements DiagnosticInfoProvider {
  title = 'B';

  collectInfo(): Promise<string> {
    return Promise.resolve('B Content\n');
  }
}

test('Should test composite diagnostic info provider', async () => {
  const compositeInfoProvider = new CompositeGeneralDiagnosticInfoProvider(new InfoProviderA(), new InfoProviderB());

  expect(compositeInfoProvider.title).toBe('General');

  const actualInfo = await compositeInfoProvider.collectInfo();
  const expectedValue = '=== A ===\nA Content\n=== B ===\nB Content\n';

  expect(actualInfo).toBe(expectedValue);
});

test('Should test about info provider', async () => {
  process.argv = ['dummy_command'];

  const aboutProvider = new AboutInfoProvider();
  const actualValue = await aboutProvider.collectInfo();
  const expectedValue = 'App Name: appName\nVersion: v0.0.1\nPackaged: true\nCommand Line: dummy_command\n\n\n';

  expect(actualValue).toBe(expectedValue);
});

test('Should test display info provider', async () => {
  const displayProvider = new DisplayInfoProvider();
  const actualValue = await displayProvider.collectInfo();
  const expectedValue = 'Display (test_display): 1x1; scale: 1\n\n\n';

  expect(actualValue).toBe(expectedValue);
});

test('Should test system info provider', async () => {
  vi.spyOn(os, 'cpus').mockReturnValue([]);
  vi.spyOn(os, 'totalmem').mockReturnValue(0);
  vi.spyOn(os, 'freemem').mockReturnValue(0);

  const systemProvider = new SystemInfoProvider();
  const actualValue = await systemProvider.collectInfo();
  const expectedValue = 'Number of CPU: 0\nUsed memory: 0 MB\nFree memory: 0 MB\nTotal memory: 0 MB\n\n\n';

  expect(actualValue).toBe(expectedValue);
});

test('Should test configuration info provider', async () => {
  const configurationRegistry = new ConfigurationRegistry();

  configurationRegistry.registerConfigurations([
    {
      id: 'preferences.Test',
      title: 'Test',
      type: 'object',
      properties: {
        ['preferences.Test']: {
          description: 'Test Description.',
          type: 'boolean',
          default: true,
        },
      },
    },
  ]);

  const configProvider = new ConfigurationInfoProvider(configurationRegistry);
  const actualValue = await configProvider.collectInfo();
  const expectedValue = 'Test: true\n\n\n';

  expect(actualValue).toBe(expectedValue);
});
