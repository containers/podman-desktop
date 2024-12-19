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

import type { Cluster, Context, User } from '@kubernetes/client-node';
import { Health } from '@kubernetes/client-node';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ContextHealthChecker } from './context-health-checker.js';
import type { KubeConfigSingleContext } from './kubeconfig-single-context.js';

vi.mock('@kubernetes/client-node');

const context1 = {
  name: 'context1',
  cluster: 'cluster1',
  user: 'user1',
};
const contexts = [context1] as Context[];

const clusters = [
  {
    name: 'cluster1',
  },
] as Cluster[];

const users = [
  {
    name: 'user1',
  },
] as User[];

const config = {
  getKubeConfig: () => ({
    contexts,
    clusters,
    users,
    currentContext: 'context1',
  }),
} as KubeConfigSingleContext;

beforeEach(() => {
  vi.mocked(Health).mockClear();
});

describe('readyz returns a value', async () => {
  const onStateChangeCB = vi.fn();
  const onReachableCB = vi.fn();
  const readyzMock = vi.fn();
  let hc: ContextHealthChecker;

  beforeEach(async () => {
    vi.mocked(Health).mockImplementation(
      () =>
        ({
          readyz: readyzMock,
        }) as unknown as Health,
    );

    hc = new ContextHealthChecker(config);

    hc.onStateChange(onStateChangeCB);
    hc.onReachable(onReachableCB);
  });

  test('onStateChange is fired with result of readyz', async () => {
    readyzMock.mockResolvedValue(true);
    await hc.start();

    expect(onStateChangeCB).toHaveBeenCalledWith({
      kubeConfig: config,
      contextName: 'context1',
      checking: true,
      reachable: false,
    });
    expect(onStateChangeCB).toHaveBeenCalledWith({
      kubeConfig: config,
      contextName: 'context1',
      checking: false,
      reachable: true,
    });

    expect(hc.getState()).toEqual({
      kubeConfig: config,
      contextName: 'context1',
      checking: false,
      reachable: true,
    });

    onStateChangeCB.mockReset();

    readyzMock.mockResolvedValue(false);
    await hc.start();
    expect(onStateChangeCB).toHaveBeenCalledWith({
      kubeConfig: config,
      contextName: 'context1',
      checking: true,
      reachable: false,
    });
    expect(onStateChangeCB).toHaveBeenCalledWith({
      kubeConfig: config,
      contextName: 'context1',
      checking: false,
      reachable: false,
    });

    expect(hc.getState()).toEqual({
      kubeConfig: config,
      contextName: 'context1',
      checking: false,
      reachable: false,
    });
  });

  test('onReachable is fired when readyz returns true', async () => {
    readyzMock.mockResolvedValue(true);
    await hc.start();

    expect(onReachableCB).toHaveBeenCalledWith({
      kubeConfig: config,
      contextName: 'context1',
      checking: false,
      reachable: true,
    });

    onReachableCB.mockReset();

    readyzMock.mockResolvedValue(false);
    await hc.start();
    expect(onReachableCB).not.toHaveBeenCalled();
  });
});

test('onStateChange is not fired when readyz is rejected with an abort error', async () => {
  const readyzMock = vi.fn();
  vi.mocked(Health).mockImplementation(
    () =>
      ({
        readyz: readyzMock,
      }) as unknown as Health,
  );

  const hc = new ContextHealthChecker(config);
  const onStateChangeCB = vi.fn();
  hc.onStateChange(onStateChangeCB);

  const err = new Error('a message');
  err.name = 'AbortError';
  readyzMock.mockRejectedValue(err);
  await hc.start();
  expect(onStateChangeCB).toHaveBeenCalledOnce();
  expect(onStateChangeCB).toHaveBeenCalledWith({
    kubeConfig: config,
    contextName: 'context1',
    checking: true,
    reachable: false,
  });
  expect(hc.getState()).toEqual({
    kubeConfig: config,
    contextName: 'context1',
    checking: true,
    reachable: false,
  });
});

test('onReadiness is called with false when readyz is rejected with a generic error', async () => {
  const readyzMock = vi.fn();
  vi.mocked(Health).mockImplementation(
    () =>
      ({
        readyz: readyzMock,
      }) as unknown as Health,
  );

  const hc = new ContextHealthChecker(config);
  const onStateChangeCB = vi.fn();
  hc.onStateChange(onStateChangeCB);

  readyzMock.mockRejectedValue(new Error('a generic error'));
  await hc.start();
  expect(onStateChangeCB).toHaveBeenCalledWith({
    kubeConfig: config,
    contextName: 'context1',
    checking: true,
    reachable: false,
  });
  expect(onStateChangeCB).toHaveBeenCalledWith({
    kubeConfig: config,
    contextName: 'context1',
    checking: false,
    reachable: false,
  });
  expect(hc.getState()).toEqual({
    kubeConfig: config,
    contextName: 'context1',
    checking: false,
    reachable: false,
  });
});
