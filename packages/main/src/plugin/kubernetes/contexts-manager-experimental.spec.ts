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

import { ContextsConnectivityRegistry } from './contexts-connectivity-registry.js';
import { ContextsManagerExperimental } from './contexts-manager-experimental.js';
import { HealthChecker } from './health-checker.js';

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

vi.mock('./health-checker.js');
vi.mock('./contexts-connectivity-registry.js');

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

  vi.mocked(HealthChecker).mockClear();
  vi.mocked(ContextsConnectivityRegistry).mockClear();
});

test('HealthChecker is built and checkReadiness is called for each context the first time', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new ContextsManagerExperimental();

  const checkReadinessMock = vi.fn();
  const onReadinessMock = vi.fn();
  const abortMock = vi.fn();

  vi.mocked(HealthChecker).mockImplementation(
    () =>
      ({
        checkReadiness: checkReadinessMock,
        onReadiness: onReadinessMock,
        abort: abortMock,
      }) as unknown as HealthChecker,
  );

  checkReadinessMock.mockResolvedValue(undefined);

  await manager.update(kc);
  expect(HealthChecker).toHaveBeenCalledTimes(2);
  const kc1 = new KubeConfig();
  kc1.loadFromOptions(kcWithContext1asDefault);
  expect(HealthChecker).toHaveBeenCalledWith(kc1);
  const kc2 = new KubeConfig();
  kc2.loadFromOptions(kcWithContext2asDefault);
  expect(HealthChecker).toHaveBeenCalledWith(kc2);

  expect(checkReadinessMock).toHaveBeenCalledTimes(2);
  expect(abortMock).not.toHaveBeenCalled();
});

test('nothing is done with called again and kubeconfig does not change', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new ContextsManagerExperimental();

  const checkReadinessMock = vi.fn();
  const onReadinessMock = vi.fn();
  const abortMock = vi.fn();

  vi.mocked(HealthChecker).mockImplementation(
    () =>
      ({
        checkReadiness: checkReadinessMock,
        onReadiness: onReadinessMock,
        abort: abortMock,
      }) as unknown as HealthChecker,
  );

  checkReadinessMock.mockResolvedValue(undefined);

  await manager.update(kc);

  // check it is not called again if kubeconfig does not change
  vi.mocked(HealthChecker).mockClear();
  vi.mocked(checkReadinessMock).mockClear();

  await manager.update(kc);
  expect(HealthChecker).not.toHaveBeenCalled();
  expect(checkReadinessMock).not.toHaveBeenCalled();
  expect(abortMock).not.toHaveBeenCalled();
});

test('HealthChecker is built and checkReadiness is called for each context if context changed', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new ContextsManagerExperimental();

  const checkReadinessMock = vi.fn();
  const onReadinessMock = vi.fn();
  const abortMock = vi.fn();

  vi.mocked(HealthChecker).mockImplementation(
    () =>
      ({
        checkReadiness: checkReadinessMock,
        onReadiness: onReadinessMock,
        abort: abortMock,
      }) as unknown as HealthChecker,
  );

  checkReadinessMock.mockResolvedValue(undefined);

  await manager.update(kc);
  expect(HealthChecker).toHaveBeenCalledTimes(2);
  const kc1 = new KubeConfig();
  kc1.loadFromOptions(kcWithContext1asDefault);
  expect(HealthChecker).toHaveBeenCalledWith(kc1);
  const kc2 = new KubeConfig();
  kc2.loadFromOptions(kcWithContext2asDefault);
  expect(HealthChecker).toHaveBeenCalledWith(kc2);

  expect(checkReadinessMock).toHaveBeenCalledTimes(2);
  expect(abortMock).not.toHaveBeenCalled();

  // check it is called again if kubeconfig changes
  vi.mocked(HealthChecker).mockClear();
  vi.mocked(checkReadinessMock).mockClear();

  kcWith2contexts.currentContext = 'context2';
  kc.loadFromOptions(kcWith2contexts);
  await manager.update(kc);
  expect(abortMock).toHaveBeenCalledTimes(2);
  expect(HealthChecker).toHaveBeenCalledTimes(2);
  expect(checkReadinessMock).toHaveBeenCalledTimes(2);
});

test('setReachable should be called with the result of the health check', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);

  const checkReadinessMock = vi.fn();
  const onReadinessMock = vi.fn();
  const abortMock = vi.fn();

  onReadinessMock.mockImplementation(f => f(true));

  vi.mocked(HealthChecker).mockImplementation(
    () =>
      ({
        checkReadiness: checkReadinessMock,
        onReadiness: onReadinessMock,
        abort: abortMock,
      }) as unknown as HealthChecker,
  );

  const setCheckingMock = vi.fn();
  const setReachableMock = vi.fn();
  vi.mocked(ContextsConnectivityRegistry).mockReturnValue({
    setChecking: setCheckingMock,
    setReachable: setReachableMock,
  } as unknown as ContextsConnectivityRegistry);

  checkReadinessMock.mockResolvedValue(undefined);
  const manager = new ContextsManagerExperimental();
  await manager.update(kc);
  expect(setReachableMock).toHaveBeenCalledTimes(2);
  expect(setReachableMock).toHaveBeenCalledWith('context1', true);
  expect(setReachableMock).toHaveBeenCalledWith('context2', true);
});

test('setChecking should be called first with false then with true when check is finished', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);

  const checkReadinessMock = vi.fn();
  const onReadinessMock = vi.fn();
  const abortMock = vi.fn();

  onReadinessMock.mockImplementation(f =>
    setTimeout(() => {
      f(true);
    }, 0),
  );

  vi.mocked(HealthChecker).mockImplementation(
    () =>
      ({
        checkReadiness: checkReadinessMock,
        onReadiness: onReadinessMock,
        abort: abortMock,
      }) as unknown as HealthChecker,
  );

  const setCheckingMock = vi.fn();
  const setReachableMock = vi.fn();
  vi.mocked(ContextsConnectivityRegistry).mockReturnValue({
    setChecking: setCheckingMock,
    setReachable: setReachableMock,
  } as unknown as ContextsConnectivityRegistry);

  checkReadinessMock.mockResolvedValue(undefined);
  const manager = new ContextsManagerExperimental();
  await manager.update(kc);
  expect(setCheckingMock).toHaveBeenCalledTimes(2);
  expect(setCheckingMock).toHaveBeenNthCalledWith(1, 'context1', true);
  expect(setCheckingMock).toHaveBeenNthCalledWith(2, 'context2', true);

  setCheckingMock.mockClear();
  await vi.waitFor(() => {
    expect(setCheckingMock).toHaveBeenCalledTimes(2);
    expect(setCheckingMock).toHaveBeenNthCalledWith(1, 'context1', false);
    expect(setCheckingMock).toHaveBeenNthCalledWith(2, 'context2', false);
  });
});
