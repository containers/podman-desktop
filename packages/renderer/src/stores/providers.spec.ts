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

import type { ProviderContainerConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import { get } from 'svelte/store';
import { assert, beforeEach, describe, expect, test, vi } from 'vitest';

import { containerConnectionCount, eventStore, providerInfos } from './providers';

const callbacks = new Map<string, (data?: unknown) => void | Promise<void>>();

beforeEach(() => {
  callbacks.clear();
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((message, callback) => {
    callbacks.set(message, callback);
    return { dispose: vi.fn() };
  });
});

test('no provider through window.getProviderInfos should make the store empty', () => {
  // fast delays (10 & 10ms)
  eventStore.setupWithDebounce(10, 10);

  // empty list
  vi.mocked(window.getProviderInfos).mockResolvedValue([]);

  // mark as ready to receive updates
  window.dispatchEvent(new CustomEvent('system-ready'));

  // now get list
  const providerListResult = get(providerInfos);
  expect(providerListResult.length).toBe(0);
});

test.each([
  ['extension-started'],
  ['extension-stopped'],
  ['provider-lifecycle-change'],
  ['provider-change'],
  ['provider-create'],
  ['provider-delete'],
  ['provider:update-status'],
  ['provider:update-warnings'],
  ['provider:update-version'],
  ['provider-register-kubernetes-connection'],
  ['provider-unregister-kubernetes-connection'],
  ['provider-register-vm-connection'],
  ['provider-unregister-vm-connection'],
  ['extensions-started'],
])('fetch providers when receiving event %s', async eventName => {
  // fast delays (10 & 10ms)
  eventStore.setupWithDebounce(10, 10);

  // empty list
  vi.mocked(window.getProviderInfos).mockResolvedValue([]);

  // mark as ready to receive updates
  window.dispatchEvent(new CustomEvent('system-ready'));

  // clear mock calls
  vi.mocked(window.getProviderInfos).mockClear();

  // now, setup at least one container
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      id: 'id123',
    } as unknown as ProviderInfo,
  ]);

  // send event ('provider-lifecycle-change' is a window listener, the rest go through window.events)
  if (eventName === 'provider-lifecycle-change') {
    window.dispatchEvent(new CustomEvent(eventName));
  } else {
    const callback = callbacks.get(eventName);
    assert(callback);
    await callback();
  }

  // wait listContainersMock is called
  await vi.waitFor(() => expect(window.getProviderInfos).toHaveBeenCalled());

  // now get list
  const providerListResult = get(providerInfos);
  expect(providerListResult.length).toBe(1);
  expect(providerListResult[0].id).toEqual('id123');
});

describe('containerConnectionCount', () => {
  const PODMAN_CONNECTION = {
    name: 'podman-machine-default',
    status: 'started',
    type: 'podman',
  } as unknown as ProviderContainerConnectionInfo;

  const PODMAN_PROVIDER: ProviderInfo = {
    id: 'podman',
    name: 'Podman',
    kubernetesConnections: [],
    vmConnections: [],
    containerConnections: [],
  } as unknown as ProviderInfo;

  const DOCKER_CONNECTION = {
    name: 'docker-context',
    status: 'started',
    type: 'docker',
  } as unknown as ProviderContainerConnectionInfo;

  const DOCKER_PROVIDER: ProviderInfo = {
    id: 'docker',
    name: 'Docker',
    kubernetesConnections: [],
    vmConnections: [],
    containerConnections: [],
  } as unknown as ProviderInfo;

  async function initProviderInfoStore(providers: ProviderInfo[]): Promise<void> {
    // fast delays (10 & 10ms)
    eventStore.setupWithDebounce(10, 10);

    // empty list
    vi.mocked(window.getProviderInfos).mockResolvedValue(providers);

    // mark as ready to receive updates
    window.dispatchEvent(new CustomEvent('system-ready'));
    await callbacks.get('provider-change')?.();

    return vi.waitFor(() => {
      expect(window.getProviderInfos).toHaveBeenCalled();
      expect(get(providerInfos)).toHaveLength(providers.length);
    });
  }

  test('should be zero if no provider are available', async () => {
    await initProviderInfoStore([]);

    expect(get(containerConnectionCount)).toEqual(
      expect.objectContaining({
        podman: 0,
        docker: 0,
      }),
    );
  });

  test('should be zero if no provider has container connection', async () => {
    await initProviderInfoStore([PODMAN_PROVIDER, DOCKER_PROVIDER]);

    expect(get(containerConnectionCount)).toEqual(
      expect.objectContaining({
        podman: 0,
        docker: 0,
      }),
    );
  });

  test('should be one if one started provider are available', async () => {
    await initProviderInfoStore([
      {
        ...PODMAN_PROVIDER,
        containerConnections: [PODMAN_CONNECTION],
      },
    ]);

    expect(get(containerConnectionCount)).toEqual(
      expect.objectContaining({
        podman: 1,
        docker: 0,
      }),
    );
  });

  test('should count podman container connections from all providers', async () => {
    await initProviderInfoStore([
      {
        ...PODMAN_PROVIDER,
        containerConnections: [PODMAN_CONNECTION],
      },
      {
        ...PODMAN_PROVIDER,
        containerConnections: [PODMAN_CONNECTION],
      },
    ]);

    expect(get(containerConnectionCount)).toEqual(
      expect.objectContaining({
        podman: 2,
        docker: 0,
      }),
    );
  });

  test('should count podman & docker container connections from all providers', async () => {
    await initProviderInfoStore([
      {
        ...PODMAN_PROVIDER,
        containerConnections: [PODMAN_CONNECTION],
      },
      {
        ...PODMAN_PROVIDER,
        containerConnections: [PODMAN_CONNECTION],
      },
      {
        ...DOCKER_PROVIDER,
        containerConnections: [DOCKER_CONNECTION],
      },
    ]);

    expect(get(containerConnectionCount)).toEqual(
      expect.objectContaining({
        podman: 2,
        docker: 1,
      }),
    );
  });
});
