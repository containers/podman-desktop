/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type { Cluster } from '@kubernetes/client-node';
import { KubeConfig } from '@kubernetes/client-node';
import { beforeEach, expect, test, vi } from 'vitest';

import type { ContextHealthState } from './context-health-checker.js';
import { ContextHealthChecker } from './context-health-checker.js';
import { ContextsManagerExperimental } from './contexts-manager-experimental.js';

const kcWithContext1asDefault = {
  contexts: [
    {
      name: 'context1',
      cluster: 'cluster1',
      user: 'user1',
    },
  ],
  clusters: [
    {
      name: 'cluster1',
    },
  ],
  users: [
    {
      name: 'user1',
    },
  ],
  currentContext: 'context1',
};

const kcWithContext2asDefault = {
  contexts: [
    {
      name: 'context2',
      cluster: 'cluster2',
      user: 'user2',
    },
  ],
  clusters: [
    {
      name: 'cluster2',
    },
  ],
  users: [
    {
      name: 'user2',
    },
  ],
  currentContext: 'context2',
};

vi.mock('./context-health-checker.js');

let kcWith2contexts: KubeConfig;

beforeEach(() => {
  kcWith2contexts = {
    contexts: [
      {
        name: 'context1',
        cluster: 'cluster1',
        user: 'user1',
      },
      {
        name: 'context2',
        cluster: 'cluster2',
        user: 'user2',
      },
    ],
    clusters: [
      {
        name: 'cluster1',
      } as Cluster,
      {
        name: 'cluster2',
      } as Cluster,
    ],
    users: [
      {
        name: 'user1',
      },
      {
        name: 'user2',
      },
    ],
  } as unknown as KubeConfig;

  vi.mocked(ContextHealthChecker).mockClear();
});

test('HealthChecker is built and start is called for each context the first time', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new ContextsManagerExperimental();

  const startMock = vi.fn();
  const disposeMock = vi.fn();
  const onStateChangeMock = vi.fn();

  vi.mocked(ContextHealthChecker).mockImplementation(
    () =>
      ({
        start: startMock,
        dispose: disposeMock,
        onStateChange: onStateChangeMock,
      }) as unknown as ContextHealthChecker,
  );

  await manager.update(kc);
  expect(ContextHealthChecker).toHaveBeenCalledTimes(2);
  const kc1 = new KubeConfig();
  kc1.loadFromOptions(kcWithContext1asDefault);
  expect(ContextHealthChecker).toHaveBeenCalledWith(kc1);
  const kc2 = new KubeConfig();
  kc2.loadFromOptions(kcWithContext2asDefault);
  expect(ContextHealthChecker).toHaveBeenCalledWith(kc2);
  expect(startMock).toHaveBeenCalledTimes(2);

  expect(disposeMock).not.toHaveBeenCalled();
});

test('nothing is done when called again and kubeconfig does not change', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new ContextsManagerExperimental();

  const startMock = vi.fn();
  const disposeMock = vi.fn();
  const onStateChangeMock = vi.fn();

  vi.mocked(ContextHealthChecker).mockImplementation(
    () =>
      ({
        start: startMock,
        dispose: disposeMock,
        onStateChange: onStateChangeMock,
      }) as unknown as ContextHealthChecker,
  );

  await manager.update(kc);

  vi.mocked(ContextHealthChecker).mockClear();
  vi.mocked(startMock).mockClear();

  // check it is not called again if kubeconfig does not change
  await manager.update(kc);
  expect(ContextHealthChecker).not.toHaveBeenCalled();
  expect(startMock).not.toHaveBeenCalled();
  expect(disposeMock).not.toHaveBeenCalled();
});

test('HealthChecker is built and start is called for each context being changed', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new ContextsManagerExperimental();

  const startMock = vi.fn();
  const disposeMock = vi.fn();
  const onStateChangeMock = vi.fn();

  vi.mocked(ContextHealthChecker).mockImplementation(
    () =>
      ({
        start: startMock,
        dispose: disposeMock,
        onStateChange: onStateChangeMock,
      }) as unknown as ContextHealthChecker,
  );

  await manager.update(kc);

  // check it is called again if kubeconfig changes
  vi.mocked(ContextHealthChecker).mockClear();
  vi.mocked(startMock).mockClear();

  kcWith2contexts.users[0]!.certFile = 'file';
  kc.loadFromOptions(kcWith2contexts);
  await manager.update(kc);
  expect(disposeMock).toHaveBeenCalledTimes(1);
  expect(ContextHealthChecker).toHaveBeenCalledTimes(1);
  expect(startMock).toHaveBeenCalledTimes(1);
});

test('HealthChecker is disposed for each context being removed', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new ContextsManagerExperimental();

  const startMock = vi.fn();
  const disposeMock = vi.fn();
  const onStateChangeMock = vi.fn();

  vi.mocked(ContextHealthChecker).mockImplementation(
    () =>
      ({
        start: startMock,
        dispose: disposeMock,
        onStateChange: onStateChangeMock,
      }) as unknown as ContextHealthChecker,
  );

  await manager.update(kc);

  // check when kubeconfig changes
  vi.mocked(ContextHealthChecker).mockClear();
  vi.mocked(startMock).mockClear();

  const kc1 = {
    contexts: [kcWith2contexts.contexts[0]],
    clusters: [kcWith2contexts.clusters[0]],
    users: [kcWith2contexts.users[0]],
  } as unknown as KubeConfig;
  kc.loadFromOptions(kc1);
  await manager.update(kc);
  expect(disposeMock).toHaveBeenCalledTimes(1);
  expect(ContextHealthChecker).toHaveBeenCalledTimes(0);
  expect(startMock).toHaveBeenCalledTimes(0);
});

test('getHealthCheckersStates calls getState for each health checker', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new ContextsManagerExperimental();

  const startMock = vi.fn();
  const disposeMock = vi.fn();
  const onStateChangeMock = vi.fn();

  vi.mocked(ContextHealthChecker).mockImplementation(
    (kubeConfig: KubeConfig) =>
      ({
        start: startMock,
        dispose: disposeMock,
        onStateChange: onStateChangeMock,
        getState: vi.fn().mockImplementation(() => {
          return {
            contextName: kubeConfig.currentContext,
            checking: kubeConfig.currentContext === 'context1' ? true : false,
            reachable: kubeConfig.currentContext === 'context1' ? false : true,
          };
        }),
      }) as unknown as ContextHealthChecker,
  );

  await manager.update(kc);

  const result = manager.getHealthCheckersStates();
  const expectedMap = new Map<string, ContextHealthState>();
  expectedMap.set('context1', { contextName: 'context1', checking: true, reachable: false });
  expectedMap.set('context2', { contextName: 'context2', checking: false, reachable: true });
  expect(result).toEqual(expectedMap);
});

test('dispose calls dispose for each health checker', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new ContextsManagerExperimental();

  const startMock = vi.fn();
  const disposeMock = vi.fn();
  const onStateChangeMock = vi.fn();

  vi.mocked(ContextHealthChecker).mockImplementation(
    () =>
      ({
        start: startMock,
        dispose: disposeMock,
        onStateChange: onStateChangeMock,
        getState: vi.fn(),
      }) as unknown as ContextHealthChecker,
  );

  await manager.update(kc);

  manager.dispose();
  expect(disposeMock).toHaveBeenCalledTimes(2);
});
