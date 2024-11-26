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

import type { Cluster, Context, KubeConfig, User } from '@kubernetes/client-node';
import { AbortError, Health } from '@kubernetes/client-node';
import { beforeEach, expect, test, vi } from 'vitest';

import { ContextHealthChecker } from './context-health-checker.js';

vi.mock('@kubernetes/client-node');

const contexts = [
  {
    name: 'context1',
    cluster: 'cluster1',
    user: 'user1',
  },
] as Context[];

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
  contexts,
  clusters,
  users,
  currentContext: 'context1',
} as unknown as KubeConfig;

beforeEach(() => {
  vi.mocked(Health).mockClear();
});

test('onStateChange is fired with result of readyz if no error', async () => {
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

  readyzMock.mockResolvedValue(true);
  await hc.start();
  expect(onStateChangeCB).toHaveBeenCalledWith({ contextName: 'context1', checking: true, reachable: false });
  expect(onStateChangeCB).toHaveBeenCalledWith({ contextName: 'context1', checking: false, reachable: true });

  expect(hc.getState()).toEqual({
    contextName: 'context1',
    checking: false,
    reachable: true,
  });

  onStateChangeCB.mockReset();

  readyzMock.mockResolvedValue(false);
  await hc.start();
  expect(onStateChangeCB).toHaveBeenCalledWith({ contextName: 'context1', checking: true, reachable: false });
  expect(onStateChangeCB).toHaveBeenCalledWith({ contextName: 'context1', checking: false, reachable: false });

  expect(hc.getState()).toEqual({
    contextName: 'context1',
    checking: false,
    reachable: false,
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

  readyzMock.mockRejectedValue(new AbortError('a message'));
  await hc.start();
  expect(onStateChangeCB).toHaveBeenCalledOnce();
  expect(onStateChangeCB).toHaveBeenCalledWith({ contextName: 'context1', checking: true, reachable: false });
  expect(hc.getState()).toEqual({
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
  expect(onStateChangeCB).toHaveBeenCalledWith({ contextName: 'context1', checking: true, reachable: false });
  expect(onStateChangeCB).toHaveBeenCalledWith({ contextName: 'context1', checking: false, reachable: false });
  expect(hc.getState()).toEqual({
    contextName: 'context1',
    checking: false,
    reachable: false,
  });
});
