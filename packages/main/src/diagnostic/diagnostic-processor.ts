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

import type { DiagnosticProviderRegistry } from '../plugin/diagnostic-provider-registry';
import path from 'path';
import os from 'os';
import fs from 'fs';

export class DiagnosticProcessor {
  private _diagnosticProviderRegistry: DiagnosticProviderRegistry;

  public constructor(diagnosticProviderRegistry: DiagnosticProviderRegistry) {
    this._diagnosticProviderRegistry = diagnosticProviderRegistry;
  }

  public async processDiagnosticInfo(): Promise<string> {
    const infoProviders = this._diagnosticProviderRegistry.getRegisteredInfoProviders();

    const diagnosticInfoFileName = 'diagnostic-information.txt';
    let info = '';

    await Promise.all(
      infoProviders.map(async provider => {
        const infoOutput = await provider.collectInfo();
        info += `=== ${provider.title} ===\n`;
        info += infoOutput;
      }),
    );

    const diagnosticInfoFile = path.join(os.tmpdir(), diagnosticInfoFileName);

    await fs.promises.writeFile(diagnosticInfoFile, info);

    return diagnosticInfoFile;
  }

  public async processDiagnosticLogs(): Promise<string[]> {
    const logsProviders = this._diagnosticProviderRegistry.getRegisteredLogsProvider();

    const logsPaths: string[] = [];
    await Promise.all(
      logsProviders.map(async provider => {
        const providerPaths = await provider.collectLogs();
        logsPaths.push(...providerPaths);
      }),
    );

    return logsPaths;
  }
}
