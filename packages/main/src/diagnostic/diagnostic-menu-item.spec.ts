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

import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import { diagnosticMenuItem } from './diagnostic-menu-item';
import type { DiagnosticProcessor } from './diagnostic-processor';
import type { ConfigurationRegistry } from '../plugin/configuration-registry';
import type { Configuration } from '@podman-desktop/api';
import { shell, dialog } from 'electron';
import { DiagnosticSettings } from './diagnostic-dialog-settings';
import { CONFIGURATION_DEFAULT_SCOPE } from '../plugin/configuration-registry-constants';

let diagnosticMenuitemFn: Electron.MenuItemConstructorOptions;
let diagnosticProcessor: DiagnosticProcessor;
let configurationRegistry: ConfigurationRegistry;

beforeAll(() => {
  diagnosticProcessor = {
    processDiagnosticInfo: vi.fn(),
    processDiagnosticLogs: vi.fn(),
  } as unknown as DiagnosticProcessor;
  configurationRegistry = {
    getConfiguration: vi.fn(),
    updateConfigurationValue: vi.fn(),
  } as unknown as ConfigurationRegistry;

  vi.mock('../logger-utils', () => {
    return {
      archiveLogs: vi.fn().mockReturnValue('/fake/zip/archive'),
    };
  });
  vi.mock('../index', () => {
    return {
      logger: {
        getLogPath: vi.fn(),
      },
    };
  });
  vi.mock('electron', () => {
    return {
      shell: {
        showItemInFolder: vi.fn(),
      },
      dialog: {
        showMessageBox: vi.fn(),
      },
    };
  });
});

beforeEach(() => {
  diagnosticMenuitemFn = diagnosticMenuItem(diagnosticProcessor, configurationRegistry);
});

afterEach(() => {
  vi.clearAllMocks();
});

function dontShowDialogOption(): Configuration {
  return {
    get: () => true,
    has: () => false,
    update: () => Promise.resolve(undefined),
  } as Configuration;
}

function showDialogOption(): Configuration {
  return {
    get: () => false,
    has: () => false,
    update: () => Promise.resolve(undefined),
  } as Configuration;
}

test('Should open file navigator with archive path', async () => {
  vi.spyOn(configurationRegistry, 'getConfiguration').mockReturnValue(dontShowDialogOption());
  vi.spyOn(diagnosticProcessor, 'processDiagnosticInfo').mockReturnValue(Promise.resolve(''));
  vi.spyOn(diagnosticProcessor, 'processDiagnosticLogs').mockReturnValue(Promise.resolve([]));

  const showItemInFolder = vi.spyOn(shell, 'showItemInFolder');

  // eslint-disable-next-line @typescript-eslint/await-thenable
  await diagnosticMenuitemFn.click(undefined, undefined, undefined);

  expect(showItemInFolder).toBeCalledWith('/fake/zip/archive');
});

test('Should do nothing if cancel option is selected', async () => {
  vi.spyOn(dialog, 'showMessageBox').mockReturnValue(Promise.resolve({ response: 0, checkboxChecked: false }));
  vi.spyOn(configurationRegistry, 'getConfiguration').mockReturnValue(showDialogOption());

  const updateConfigurationValue = vi.spyOn(configurationRegistry, 'updateConfigurationValue');

  // eslint-disable-next-line @typescript-eslint/await-thenable
  await diagnosticMenuitemFn.click(undefined, undefined, undefined);

  expect(updateConfigurationValue).toBeCalledTimes(0);
});

test('Should update configuration value when do not show dialog checkbox selected', async () => {
  vi.spyOn(dialog, 'showMessageBox').mockReturnValue(Promise.resolve({ response: 1, checkboxChecked: true }));
  vi.spyOn(configurationRegistry, 'getConfiguration').mockReturnValue(showDialogOption());
  vi.spyOn(diagnosticProcessor, 'processDiagnosticInfo').mockReturnValue(Promise.resolve(''));
  vi.spyOn(diagnosticProcessor, 'processDiagnosticLogs').mockReturnValue(Promise.resolve([]));

  const updateConfigurationValue = vi.spyOn(configurationRegistry, 'updateConfigurationValue');
  const showItemInFolder = vi.spyOn(shell, 'showItemInFolder');

  // eslint-disable-next-line @typescript-eslint/await-thenable
  await diagnosticMenuitemFn.click(undefined, undefined, undefined);

  expect(updateConfigurationValue).toBeCalledWith(
    DiagnosticSettings.SectionName + '.' + DiagnosticSettings.DontShowDialog,
    true,
    CONFIGURATION_DEFAULT_SCOPE,
  );
  expect(showItemInFolder).toBeCalledWith('/fake/zip/archive');
});
