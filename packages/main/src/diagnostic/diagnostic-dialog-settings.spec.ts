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

import { beforeEach, expect, test, vi } from 'vitest';
import { ConfigurationRegistry } from '../plugin/configuration-registry';
import { DiagnosticDialogSettings, diagnosticPreferencesKey, DiagnosticSettings } from './diagnostic-dialog-settings';

let configurationRegistry: ConfigurationRegistry;
let dialogSettings: DiagnosticDialogSettings;

beforeEach(() => {
  configurationRegistry = new ConfigurationRegistry();
  dialogSettings = new DiagnosticDialogSettings(configurationRegistry);
});

test('Should initialize diagnostic dialog settings', async () => {
  const registerSpy = vi.spyOn(configurationRegistry, 'registerConfigurations');

  await dialogSettings.init();

  expect(registerSpy).toBeCalledWith([
    {
      id: diagnosticPreferencesKey,
      title: 'Dont Show Warning Dialog',
      type: 'object',
      properties: {
        [DiagnosticSettings.SectionName + '.' + DiagnosticSettings.DontShowDialog]: {
          description: "Hide the dialog when 'Collect Logs and Diagnostic Data' is clicked.",
          type: 'boolean',
          default: false,
        },
      },
    },
  ]);
});
