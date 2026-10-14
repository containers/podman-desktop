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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import type {
  ProviderConnectionInfo,
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '@desktop-framework/api';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import TroubleshootingContainerEngines from './TroubleshootingContainerEngines.svelte';

// mock ProviderContainerInfo
const socketPath = '/foo/socket.path';
const name = 'fooEngine';
const status = 'started';
const containerEngineRunning = {
  name,
  status,
  endpoint: {
    socketPath,
  },
} as unknown as ProviderContainerConnectionInfo;
// mock ProviderInfo
const internalId = 'some256';
const id = 'someid256';
const extensionId = 'my-extension';
const providerName = 'my-provider-name';
const containerConnections: ProviderConnectionInfo[] = [containerEngineRunning];
const kubernetesConnections: ProviderKubernetesConnectionInfo[] = [];
const vmConnections: ProviderConnectionInfo[] = [];
const providerStatus = 'started';
const providerInfo = {
  internalId,
  id,
  extensionId,
  providerName,
  containerConnections,
  kubernetesConnections,
  vmConnections,
  providerStatus,
} as unknown as ProviderInfo;
const providers = [providerInfo];

test('Check containers connections widget is there', async () => {
  render(TroubleshootingContainerEngines, {});

  // expect to be in a region with label Container Connections
  const region = screen.getByRole('region', { name: 'Container Connections' });
  expect(region).toBeInTheDocument();
});

test('Check containers connections status show correct information', async () => {
  render(TroubleshootingContainerEngines, { providers });

  // expect to have the name label
  const statusElement = screen.getByRole('status', { name: 'Container connections count' });
  expect(statusElement).toBeInTheDocument();
  expect(statusElement).toHaveTextContent('1 (1 running)');
});
