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

/* eslint-disable @typescript-eslint/no-empty-function */

import { beforeAll, beforeEach, expect, test, vi } from 'vitest';
import type { ContainerProviderRegistry } from './container-registry';

import { ProviderRegistry } from './provider-registry';
import type { Telemetry } from './telemetry/telemetry';

let providerRegistry: ProviderRegistry;

const telemetryTrackMock = vi.fn();
const apiSenderSendMock = vi.fn();
beforeAll(() => {
  const telemetry: Telemetry = {
    track: telemetryTrackMock,
  } as unknown as Telemetry;
  const apiSender = {
    send: apiSenderSendMock,
  };
  const containerRegistry: ContainerProviderRegistry = {} as ContainerProviderRegistry;
  providerRegistry = new ProviderRegistry(apiSender, containerRegistry, telemetry);
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('should initialize provider if there is kubernetes connection provider', async () => {
  let providerInternalId;

  apiSenderSendMock.mockImplementation((message, data) => {
    expect(message).toBe('provider-create');
    providerInternalId = data;
  });

  const provider = providerRegistry.createProvider({ id: 'internal', name: 'internal', status: 'installed' });

  let initalizeCalled = false;
  provider.setKubernetesProviderConnectionFactory({
    initialize: async () => {
      initalizeCalled = true;
    },
  });

  expect(providerInternalId).toBeDefined();
  await providerRegistry.initializeProvider(providerInternalId);

  expect(telemetryTrackMock).toHaveBeenNthCalledWith(1, 'createProvider', {
    name: 'internal',
    status: 'installed',
  });

  expect(initalizeCalled).toBe(true);
  expect(apiSenderSendMock).toBeCalled();
});

test('should initialize provider if there is container connection provider', async () => {
  let providerInternalId;

  apiSenderSendMock.mockImplementation((message, data) => {
    expect(message).toBe('provider-create');
    providerInternalId = data;
  });

  const provider = providerRegistry.createProvider({ id: 'internal', name: 'internal', status: 'installed' });

  let initalizeCalled = false;
  provider.setContainerProviderConnectionFactory({
    initialize: async () => {
      initalizeCalled = true;
    },
    create: async () => {},
  });

  expect(providerInternalId).toBeDefined();
  await providerRegistry.initializeProvider(providerInternalId);

  expect(telemetryTrackMock).toHaveBeenNthCalledWith(1, 'createProvider', {
    name: 'internal',
    status: 'installed',
  });

  expect(initalizeCalled).toBe(true);
  expect(apiSenderSendMock).toBeCalled();
});
