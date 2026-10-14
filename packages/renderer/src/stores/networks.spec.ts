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
import { get } from 'svelte/store';
import { assert, beforeEach, expect, test, vi } from 'vitest';

import type { NetworkInfoUI } from '/@/lib/network/NetworkInfoUI';

import { networksEventStore, networksListInfo, setNetworkStatus } from './networks';

const callbacks = new Map<string, (data?: unknown) => void | Promise<void>>();

beforeEach(() => {
  callbacks.clear();
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((message, callback) => {
    callbacks.set(message, callback);
    return { dispose: vi.fn() };
  });
});

test.each([
  ['container-created-event'],
  ['container-stopped-event'],
  ['container-kill-event'],
  ['container-die-event'],
  ['container-init-event'],
  ['container-started-event'],
  ['container-removed-event'],
  ['network-event'],
])('fetch networks when receiving event %s', async eventName => {
  // fast delays (10 & 10ms)
  networksEventStore.setupWithDebounce(10, 10);

  // empty list
  vi.mocked(window.listNetworks).mockResolvedValue([]);

  // mark as ready to receive updates
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // clear mock calls
  vi.mocked(window.listNetworks).mockClear();

  vi.mocked(window.listNetworks).mockResolvedValue([
    {
      Name: 'network1',
      Id: 'network1',
    } as unknown as NetworkInspectInfo,
  ]);

  // send event
  const callback = callbacks.get(eventName);
  assert(callback);
  await callback();

  await vi.waitFor(() => {
    expect(vi.mocked(window.listNetworks).mock.calls.length).not.equal(0);
    const networkListResult = get(networksListInfo);
    expect(networkListResult).toHaveLength(1);
    expect(networkListResult[0].id).toEqual('network1');
  });
});

test('store holds converted NetworkInfoUI objects with labels and subnets', async () => {
  // fast delays (10 & 10ms)
  networksEventStore.setupWithDebounce(10, 10);

  // empty list
  vi.mocked(window.listNetworks).mockResolvedValue([]);

  // mark as ready to receive updates
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // clear mock calls
  vi.mocked(window.listNetworks).mockClear();

  vi.mocked(window.listNetworks).mockResolvedValue([
    {
      Name: 'network1',
      Id: 'network1',
      Driver: 'bridge',
      Created: '2023-01-01T00:00:00Z',
      Scope: 'local',
      EnableIPv6: false,
      engineId: 'engine1',
      engineName: 'Podman',
      engineType: 'podman',
      Labels: { env: 'production' },
      IPAM: {
        Config: [{ Subnet: '172.20.0.0/16' }],
      },
    } as unknown as NetworkInspectInfo,
  ]);

  // send event
  const callback = callbacks.get('network-event');
  assert(callback);
  await callback();

  await vi.waitFor(() => {
    expect(vi.mocked(window.listNetworks).mock.calls.length).not.equal(0);
    const networkListResult = get(networksListInfo);
    expect(networkListResult).toHaveLength(1);
    expect(networkListResult[0].labels).toEqual({ env: 'production' });
    expect(networkListResult[0].subnets).toEqual(['172.20.0.0/16']);
  });
});

test('setNetworkStatus updates the status', () => {
  const network1 = {
    id: 'network1',
    engineId: 'engine1',
    status: 'UNUSED',
    selected: true,
  } as NetworkInfoUI;
  const network2 = { id: 'network2', engineId: 'engine1', status: 'USED', selected: false } as NetworkInfoUI;
  networksListInfo.set([network1, network2]);

  setNetworkStatus('engine1', 'network1', 'DELETING');

  const result = get(networksListInfo);
  expect(result[0]).not.toBe(network1);
  expect(result[0].status).toBe('DELETING');
  expect(result[0].selected).toBe(true);
  expect(result[1]).toBe(network2);
});

test('setNetworkStatus does not update a network with a matching id but a different engineId', () => {
  const network1 = { id: 'network1', engineId: 'engine1', status: 'UNUSED', selected: false } as NetworkInfoUI;
  const network2 = { id: 'network1', engineId: 'engine2', status: 'UNUSED', selected: false } as NetworkInfoUI;
  networksListInfo.set([network1, network2]);

  setNetworkStatus('engine1', 'network1', 'DELETING');

  const result = get(networksListInfo);
  expect(result[0].status).toBe('DELETING');
  expect(result[1]).toBe(network2);
  expect(result[1].status).toBe('UNUSED');
});
