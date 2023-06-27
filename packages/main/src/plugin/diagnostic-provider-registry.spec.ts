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

import { expect, test } from 'vitest';
import { DiagnosticProviderRegistry } from './diagnostic-provider-registry';
import type { DiagnosticInfoProvider, DiagnosticLogsProvider } from '@podman-desktop/api';

class DummyInfoProvider implements DiagnosticInfoProvider {
  title = 'DummyInfo';

  collectInfo(): Promise<string> {
    return Promise.resolve('');
  }
}

class DummyLogsProvider implements DiagnosticLogsProvider {
  title = 'DummyLogs';

  collectLogs(): Promise<string[]> {
    return Promise.resolve([]);
  }
}

test('Should register and dispose the diagnostic info provider', () => {
  const diagnosticProviderRegistry = new DiagnosticProviderRegistry();
  const dummyProvider = new DummyInfoProvider();

  const registeredInfoProvidersBefore = diagnosticProviderRegistry.getRegisteredInfoProviders();
  expect(registeredInfoProvidersBefore?.length).toBe(0);

  const providerDisposable = diagnosticProviderRegistry.registerDiagnosticInfoProvider(dummyProvider);
  expect(providerDisposable).toBeDefined();

  let registeredInfoProvidersAfter = diagnosticProviderRegistry.getRegisteredInfoProviders();
  expect(registeredInfoProvidersAfter.length).toBe(1);
  expect(registeredInfoProvidersAfter[0].title).toBe('DummyInfo');

  providerDisposable.dispose();

  registeredInfoProvidersAfter = diagnosticProviderRegistry.getRegisteredInfoProviders();
  expect(registeredInfoProvidersAfter.length).toBe(0);
});

test('Should register and dispose the diagnostic logs provider', () => {
  const diagnosticProviderRegistry = new DiagnosticProviderRegistry();
  const dummyProvider = new DummyLogsProvider();

  const registeredLogsProvidersBefore = diagnosticProviderRegistry.getRegisteredLogsProvider();
  expect(registeredLogsProvidersBefore?.length).toBe(0);

  const providerDisposable = diagnosticProviderRegistry.registerDiagnosticLogsProvider(dummyProvider);
  expect(providerDisposable).toBeDefined();

  let registeredLogsProvidersAfter = diagnosticProviderRegistry.getRegisteredLogsProvider();
  expect(registeredLogsProvidersAfter.length).toBe(1);
  expect(registeredLogsProvidersAfter[0].title).toBe('DummyLogs');

  providerDisposable.dispose();

  registeredLogsProvidersAfter = diagnosticProviderRegistry.getRegisteredLogsProvider();
  expect(registeredLogsProvidersAfter.length).toBe(0);
});

test('Should register providers on registry initialization', () => {
  const dummyInfoProvider = new DummyInfoProvider();
  const dummyLogsProvider = new DummyLogsProvider();

  const diagnosticProviderRegistry = new DiagnosticProviderRegistry([dummyInfoProvider], [dummyLogsProvider]);

  const registeredInfoProviders = diagnosticProviderRegistry.getRegisteredInfoProviders();
  expect(registeredInfoProviders?.length).toBe(1);

  const registeredLogsProviders = diagnosticProviderRegistry.getRegisteredLogsProvider();
  expect(registeredLogsProviders?.length).toBe(1);
});

test('Should throw error, when two info providers with same title register', () => {
  const dummyInfoProvider = new DummyInfoProvider();

  expect(() => new DiagnosticProviderRegistry([dummyInfoProvider, dummyInfoProvider], [])).toThrowError(
    new Error('Diagnostic info provider with title DummyInfo has been already registered.'),
  );
});

test('Should throw error, when two logs providers with same title register', () => {
  const dummyLogsProvider = new DummyLogsProvider();

  expect(() => new DiagnosticProviderRegistry([], [dummyLogsProvider, dummyLogsProvider])).toThrowError(
    new Error('Diagnostic logs provider with title DummyLogs has been already registered.'),
  );
});
