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

import { beforeEach, expect, test } from 'vitest';
import { DiagnosticProviderRegistry } from '../plugin/diagnostic-provider-registry';
import type { DiagnosticInfoProvider, DiagnosticLogsProvider } from '@podman-desktop/api';
import { DiagnosticProcessor } from './diagnostic-processor';
import fs from 'fs';

let diagnosticProviderRegistry: DiagnosticProviderRegistry;
let diagnosticProcessor: DiagnosticProcessor;

class DummyDiagnosticInfoProvider implements DiagnosticInfoProvider {
  title = 'Dummy Info Title';

  collectInfo(): Promise<string> {
    return Promise.resolve('Dummy Info');
  }
}

class DummyDiagnosticLogsProvider implements DiagnosticLogsProvider {
  title = 'Dummy Logs Title';

  collectLogs(): Promise<string[]> {
    return Promise.resolve(['/a', '/b', '/c']);
  }
}

beforeEach(() => {
  diagnosticProviderRegistry = new DiagnosticProviderRegistry(
    [new DummyDiagnosticInfoProvider()],
    [new DummyDiagnosticLogsProvider()],
  );
  diagnosticProcessor = new DiagnosticProcessor(diagnosticProviderRegistry);
});

test('Should process diagnostic info', async () => {
  const diagnosticInfoFile = await diagnosticProcessor.processDiagnosticInfo();

  expect(diagnosticInfoFile).toBeDefined();

  const actualValue = Buffer.from(fs.readFileSync(diagnosticInfoFile)).toString();
  const expectedValue = '=== Dummy Info Title ===\nDummy Info';

  expect(actualValue).toBe(expectedValue);
});

test('Should process diagnostic logs', async () => {
  const diagnosticLogs = await diagnosticProcessor.processDiagnosticLogs();

  expect(diagnosticLogs).toBeDefined();
  expect(diagnosticLogs.length).toBe(3);
  expect(diagnosticLogs[0]).toBe('/a');
  expect(diagnosticLogs[1]).toBe('/b');
  expect(diagnosticLogs[2]).toBe('/c');
});
