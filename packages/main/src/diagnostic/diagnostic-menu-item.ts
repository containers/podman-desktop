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

import type { DiagnosticProcessor } from './diagnostic-processor';
import { logger } from '../index';
import { archiveLogs } from '../logger-utils';
import type { ConfigurationRegistry } from '../plugin/configuration-registry';
import { DiagnosticSettings } from './diagnostic-dialog-settings';
import { dialog, shell } from 'electron';
import { CONFIGURATION_DEFAULT_SCOPE } from '../plugin/configuration-registry-constants';
import { isMac } from '../util';

export function diagnosticMenuItem(
  diagnosticProcessor: DiagnosticProcessor,
  configurationRegistry: ConfigurationRegistry,
): Electron.MenuItemConstructorOptions {
  return {
    label: 'Collect Logs and Diagnostic Data',
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    click: async () => {
      const dontShowDialog = configurationRegistry
        .getConfiguration(DiagnosticSettings.SectionName)
        .get<boolean>(DiagnosticSettings.DontShowDialog);
      if (!dontShowDialog) {
        const { response, checkboxChecked } = await dialog.showMessageBox({
          title: 'Sensitive Data',
          message: 'Included logs may contain sensitive data.',
          checkboxLabel: "Don't ask again",
          buttons: ['Cancel', isMac() ? 'Show in Finder' : 'Show in File Explorer'],
        });

        if (response === 0) {
          return;
        }

        if (checkboxChecked) {
          await configurationRegistry.updateConfigurationValue(
            DiagnosticSettings.SectionName + '.' + DiagnosticSettings.DontShowDialog,
            checkboxChecked,
            CONFIGURATION_DEFAULT_SCOPE,
          );
        }
      }

      const diagnosticInfoFile = await diagnosticProcessor.processDiagnosticInfo();
      const diagnosticLogsPaths = await diagnosticProcessor.processDiagnosticLogs();
      const zippedLogsPath = await archiveLogs(logger.getLogPath(), diagnosticInfoFile, ...diagnosticLogsPaths);

      shell.showItemInFolder(zippedLogsPath);
    },
  };
}
