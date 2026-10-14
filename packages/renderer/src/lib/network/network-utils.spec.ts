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

import type { NetworkInspectInfo } from '@desktop-framework/api';
import type { NetworkContainer } from 'dockerode';
import { beforeEach, expect, test, vi } from 'vitest';

import { findMatchInLeaves } from '/@/stores/search-util';

import { NetworkUtils } from './network-utils';

let networkUtils: NetworkUtils;

const network1: NetworkInspectInfo = {
  engineId: 'podman1',
  engineName: 'Podman 1',
  engineType: 'podman',
  Name: 'Network 1',
  Id: '123456789012345',
  Created: '',
  Scope: '',
  Driver: '',
  EnableIPv6: false,
  Internal: false,
  Attachable: false,
  Ingress: false,
  ConfigOnly: false,
};

const network2: NetworkInspectInfo = {
  engineId: 'podman2',
  engineName: 'Podman 2',
  engineType: 'podman',
  Name: 'Network 2',
  Id: '123456789123456',
  Created: '',
  Scope: '',
  Driver: '',
  EnableIPv6: false,
  Internal: false,
  Attachable: false,
  Ingress: false,
  ConfigOnly: false,
  Containers: { container1: { Name: 'Container 1' } as unknown as NetworkContainer },
};

beforeEach(() => {
  vi.clearAllMocks();
  networkUtils = new NetworkUtils();
});

test('Should expect to have a valid NetworkInfoUI object', async () => {
  const networkInfo = networkUtils.toNetworkInfoUI(network1);
  expect(networkInfo).toEqual({
    id: '123456789012345',
    shortId: '123456789012',
    name: 'Network 1',
    driver: '',
    created: '',
    engineId: 'podman1',
    engineName: 'Podman 1',
    engineType: 'podman',
    selected: false,
    status: 'UNUSED',
    ipv6_enabled: false,
    containers: [],
  });

  const networkInfo2 = networkUtils.toNetworkInfoUI(network2);
  expect(networkInfo2).toEqual({
    id: '123456789123456',
    shortId: '123456789123',
    name: 'Network 2',
    driver: '',
    created: '',
    engineId: 'podman2',
    engineName: 'Podman 2',
    engineType: 'podman',
    selected: false,
    status: 'USED',
    ipv6_enabled: false,
    containers: [{ id: 'container1', name: 'Container 1' }],
  });
});

test('Should leave labels, options and subnets undefined when the network carries none', async () => {
  const networkInfo = networkUtils.toNetworkInfoUI(network1);
  expect(networkInfo.labels).toBeUndefined();
  expect(networkInfo.options).toBeUndefined();
  expect(networkInfo.subnets).toBeUndefined();
});

test('Should expose labels, options and subnets when the network carries them', async () => {
  const networkWithMetadata: NetworkInspectInfo = {
    engineId: 'podman3',
    engineName: 'Podman 3',
    engineType: 'podman',
    Name: 'Network 3',
    Id: '123456789765432',
    Created: '',
    Scope: '',
    Driver: '',
    EnableIPv6: false,
    Internal: false,
    Attachable: false,
    Ingress: false,
    ConfigOnly: false,
    Labels: { env: 'production' },
    Options: { 'com.docker.network.bridge.name': 'br-custom' },
    IPAM: {
      Config: [{ Subnet: '172.20.0.0/16' }, { Gateway: '172.20.0.1' }],
    },
  };

  const networkInfo = networkUtils.toNetworkInfoUI(networkWithMetadata);
  expect(networkInfo.labels).toEqual({ env: 'production' });
  expect(networkInfo.options).toEqual({ 'com.docker.network.bridge.name': 'br-custom' });
  // the entry without a Subnet is filtered out, no undefined lands in the array
  expect(networkInfo.subnets).toEqual(['172.20.0.0/16']);
});

test('Should let list search match labels, options and subnets via findMatchInLeaves', async () => {
  const networkWithMetadata: NetworkInspectInfo = {
    engineId: 'podman4',
    engineName: 'Podman 4',
    engineType: 'podman',
    Name: 'Network 4',
    Id: '123456789098765',
    Created: '',
    Scope: '',
    Driver: '',
    EnableIPv6: false,
    Internal: false,
    Attachable: false,
    Ingress: false,
    ConfigOnly: false,
    Labels: { env: 'staging' },
    Options: { 'com.docker.network.driver.mtu': '1500' },
    IPAM: {
      Config: [{ Subnet: '10.10.0.0/24' }],
    },
  };

  const networkInfo = networkUtils.toNetworkInfoUI(networkWithMetadata);
  expect(findMatchInLeaves(networkInfo, 'staging')).toBeTruthy();
  expect(findMatchInLeaves(networkInfo, '1500')).toBeTruthy();
  expect(findMatchInLeaves(networkInfo, '10.10.0.0/24')).toBeTruthy();
});
